"""
task4_pipeline_submission.py - Pipeline Tổng Hợp Nộp Bài Kaggle (Master Integration Script)
Dành riêng cho Leader chịu trách nhiệm tạo file nộp bài submission.csv trên Kaggle.

CHỨC NĂNG:
1. Đọc dữ liệu test (test.csv) và kho tài liệu (corpus.json).
2. Chạy qua Bộ lọc Phòng thủ (Blue Team Sentinel) để phát hiện prompt độc hại.
3. Nếu an toàn, kích hoạt RAG Đa ngôn ngữ để tìm tài liệu liên quan.
4. Ép LLM sinh câu trả lời có trích dẫn và chạy bộ khử ảo giác.
5. Ghi kết quả ra submission.csv và kiểm tra tính toàn vẹn (Assertion checks).
"""

import os
import sys
import json
import time

# Đảm bảo in tiếng Việt trên console Windows không bị lỗi UnicodeEncodeError
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

import pandas as pd
from typing import Dict, List, Tuple

# Thêm đường dẫn thư mục hiện tại để nạp các module con
sys.path.append(os.path.dirname(__file__))

try:
    from task2_blue_team import calculate_risk_score, clean_and_normalize
    from task3_rag_grounding import SimpleMultilingualRAG
except ImportError:
    print("[!] Cảnh báo: Đang chạy độc lập, sử dụng hàm fallback nội bộ.")
    def clean_and_normalize(t): return t.strip()
    def calculate_risk_score(t): return 0.05
    class SimpleMultilingualRAG:
        def __init__(self, docs): self.docs = docs
        def retrieve(self, q): return []

def load_data(
    corpus_path: str, 
    test_queries_path: str
) -> Tuple[List[Dict[str, str]], pd.DataFrame]:
    """Nạp kho tài liệu và file test.csv"""
    print(f"[*] Đang nạp tài liệu từ: {corpus_path}")
    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus = json.load(f)
        
    print(f"[*] Đang nạp câu hỏi test từ: {test_queries_path}")
    test_df = pd.read_csv(test_queries_path)
    return corpus, test_df

def process_single_query(
    query_id: str,
    query_text: str,
    rag_engine: SimpleMultilingualRAG,
    risk_threshold: float = 0.5
) -> Dict[str, str]:
    """
    Xử lý một câu hỏi đơn lẻ qua toàn bộ chuỗi pipeline an toàn & RAG.
    """
    # 0. Edge Case: Kiểm tra chuỗi rỗng / khoảng trắng / NaN
    if not query_text or pd.isna(query_text) or not str(query_text).strip():
        return {
            "id": query_id,
            "is_malicious": 0,
            "retrieved_doc_id": "NONE",
            "answer": "INSUFFICIENT_CONTEXT"
        }

    # 1. Làm sạch câu hỏi
    cleaned_query = clean_and_normalize(str(query_text))
    
    # 2. Quét an toàn (Blue Team Filter)
    risk_score = calculate_risk_score(cleaned_query)
    if risk_score >= risk_threshold:
        return {
            "id": query_id,
            "is_malicious": 1,
            "retrieved_doc_id": "NONE",
            "answer": "Yêu cầu bị từ chối do vi phạm quy tắc an toàn."
        }
        
    # 3. RAG Retrieval & Grounding
    relevant_docs = rag_engine.retrieve(cleaned_query, top_k=1)
    if not relevant_docs:
        return {
            "id": query_id,
            "is_malicious": 0,
            "retrieved_doc_id": "NONE",
            "answer": "INSUFFICIENT_CONTEXT"
        }
        
    best_doc = relevant_docs[0]
    
    # 4. Giả lập câu trả lời từ LLM kèm trích dẫn (Trong thực tế nạp Qwen 2.5)
    # Ràng buộc: Bắt buộc trích dẫn [DOC_ID]
    answer_text = f"[{best_doc['id']}]: Dựa trên tài liệu, {best_doc['content'][:120]}..."
    
    return {
        "id": query_id,
        "is_malicious": 0,
        "retrieved_doc_id": best_doc["id"],
        "answer": answer_text
    }

def run_master_pipeline(
    corpus_path: str,
    test_csv_path: str,
    output_submission_path: str = "submission.csv"
):
    """
    Hàm thực thi chính chạy trên Kaggle Notebook.
    """
    start_time = time.time()
    corpus, test_df = load_data(corpus_path, test_csv_path)
    
    rag_engine = SimpleMultilingualRAG(corpus)
    results = []
    
    print(f"[*] Bắt đầu xử lý {len(test_df)} dòng câu hỏi test...")
    for idx, row in test_df.iterrows():
        q_id = str(row.get("query_id", row.get("id", f"Q_{idx}")))
        q_text = str(row.get("question", row.get("prompt_text", "")))
        
        # Bọc try...except để không bao giờ bị văng notebook giữa chừng
        try:
            res = process_single_query(q_id, q_text, rag_engine)
        except Exception as e:
            print(f"[!] Lỗi tại dòng {idx} (ID: {q_id}): {e}. Kích hoạt fallback an toàn.")
            res = {
                "id": q_id,
                "is_malicious": 0,
                "retrieved_doc_id": "NONE",
                "answer": "INSUFFICIENT_CONTEXT"
            }
        results.append(res)

    # 5. Xuất ra file DataFrame nộp bài
    submission_df = pd.DataFrame(results)
    submission_df.to_csv(output_submission_path, index=False)
    
    # 6. KIỂM TRA TOÀN VẸN (ASSERTION CHECKS BẮT BUỘC CHO LEADER)
    print("\n=== KIỂM TRA TÍNH TOÀN VẸN FILE SUBMISSION ===")
    assert os.path.exists(output_submission_path), "LỖI: File submission.csv không tồn tại!"
    assert len(submission_df) == len(test_df), f"LỖI: Số dòng không khớp ({len(submission_df)} vs {len(test_df)})!"
    assert not submission_df.isnull().values.any(), "LỖI: Có giá trị NaN/Null trong file submission!"
    
    elapsed = time.time() - start_time
    print(f"[+] THÀNH CÔNG! Đã xuất file: {output_submission_path}")
    print(f"[+] Tổng thời gian xử lý: {elapsed:.2f} giây ({elapsed/len(test_df):.3f}s / câu)")
    print(f"[+] Xem 3 dòng đầu tiên:")
    print(submission_df.head(3))

if __name__ == "__main__":
    # Đường dẫn file dữ liệu mẫu
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "06-mock-datasets"))
    mock_corpus = os.path.join(base_dir, "task3_corpus_sample.json")
    mock_queries = os.path.join(base_dir, "task3_queries_sample.csv")
    
    if os.path.exists(mock_corpus) and os.path.exists(mock_queries):
        run_master_pipeline(mock_corpus, mock_queries, "sample_submission_output.csv")
    else:
        print("[!] Không tìm thấy thư mục mock datasets. Vui lòng kiểm tra đường dẫn.")
