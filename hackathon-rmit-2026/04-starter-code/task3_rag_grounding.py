"""
task3_rag_grounding.py - Starter Code cho Task 3: Multilingual RAG & Chống Ảo Giác
Mục tiêu:
1. Đánh chỉ mục văn bản đa ngôn ngữ (Việt / Mã Lai / Anh).
2. Truy xuất bằng Hybrid Search (Từ khóa BM25 + Ngữ nghĩa).
3. Prompt nghiêm ngặt ép model chỉ trả lời khi có bằng chứng trong Context.
"""

from typing import List, Dict

# Mẫu Prompt Grounding nghiêm ngặt chống Hallucination
GROUNDED_PROMPT_TEMPLATE = """Bạn là trợ lý AI chuyên gia bảo mật tại RMIT.
Nhiệm vụ của bạn là trả lời câu hỏi dựa DUY NHẤT vào thông tin có trong phần 'NGỮ CẢNH' dưới đây.

RÀNG BUỘC NGHIÊM NGẶT:
1. Tuyệt đối không tự suy diễn hoặc dùng kiến thức ngoài 'NGỮ CẢNH'.
2. Nếu trong 'NGỮ CẢNH' không chứa câu trả lời trực tiếp hoặc thông tin không rõ ràng, bạn BẮT BUỘC phải trả lời chính xác: 'INSUFFICIENT_CONTEXT'.
3. Mọi câu trả lời hợp lệ phải trích dẫn tên tài liệu (ví dụ: '[DOC_01]').

---
NGỮ CẢNH:
{context}
---

CÂU HỎI: {question}

CÂU TRẢ LỜI:"""

class SimpleMultilingualRAG:
    def __init__(self, documents: List[Dict[str, str]]):
        """
        documents = [
            {"id": "DOC_01", "content": "Thời gian timeout session trên server RMIT là 15 phút."},
            {"id": "DOC_02", "content": "Dasar keselamatan kata laluan menghendaki sekurang-kurangnya 12 aksara."}
        ]
        """
        self.documents = documents

    def retrieve(self, query: str, top_k: int = 1) -> List[Dict[str, str]]:
        """
        Mô phỏng truy xuất tài liệu liên quan nhất.
        Trong thực tế, kết hợp BM25 + BGE-M3 Embedding.
        """
        results = []
        query_words = set(query.lower().split())
        for doc in self.documents:
            doc_words = set(doc["content"].lower().split())
            overlap = len(query_words.intersection(doc_words))
            if overlap > 0:
                results.append((overlap, doc))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in results[:top_k]]

    def generate_grounded_prompt(self, query: str) -> str:
        relevant_docs = self.retrieve(query)
        if not relevant_docs:
            context_str = "Không tìm thấy tài liệu phù hợp."
        else:
            context_str = "\n".join([f"[{doc['id']}]: {doc['content']}" for doc in relevant_docs])
        
        return GROUNDED_PROMPT_TEMPLATE.format(context=context_str, question=query)

if __name__ == "__main__":
    docs = [
        {"id": "DOC_SERVER_01", "content": "Cấu hình session timeout trên hệ thống portal sinh viên RMIT là 15 phút."},
        {"id": "DOC_AUTH_02", "content": "Mật khẩu quản trị viên bắt buộc phải đổi định kỳ mỗi 90 ngày."}
    ]
    
    rag = SimpleMultilingualRAG(docs)
    
    q1 = "Session timeout của portal sinh viên RMIT là bao nhiêu?"
    q2 = "Ai là hiệu trưởng hiện tại của RMIT?"
    
    print("=== PROMPT TRUY XUẤT CHO CÂU HỎI 1 (CÓ DỮ LIỆU) ===")
    print(rag.generate_grounded_prompt(q1))
    
    print("\n=== PROMPT TRUY XUẤT CHO CÂU HỎI 2 (KHÔNG CÓ DỮ LIỆU) ===")
    print(rag.generate_grounded_prompt(q2))
