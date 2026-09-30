# 12. Advanced RAG Triad & Hallucination Benchmarking (Ragas & TruLens)

Trong Task 3 và Task 4 của RMIT Hackathon 2026, thử thách lớn nhất của Generative AI không phải là sinh ra văn bản dài hay trôi chảy, mà là **Loại bỏ triệt để hiện tượng Ảo Giác (Hallucination Mitigation)** và đảm bảo mọi phát biểu của mô hình đều được **Căn cứ vững chắc (Grounded)** vào kho tri thức bản địa được cung cấp.

---

## 1. Bộ Ba Thước Đo RAG: The RAG Triad (Ragas & TruLens Framework)

```mermaid
graph TD
    Query["Câu Hỏi Người Dùng (Query)"]
    Context["Đoạn Trích Truy Xuất (Retrieved Context)"]
    Answer["Câu Trả Lời Sinh Ra (Generated Answer)"]

    Query <-->|1. Context Relevance<br/>(Ngữ cảnh có sát với câu hỏi không?)| Context
    Context <-->|2. Groundedness / Faithfulness<br/>(Câu trả lời có dựa 100% vào tài liệu không?)| Answer
    Query <-->|3. Answer Relevance<br/>(Câu trả lời có giải quyết đúng ý câu hỏi không?)| Answer

    classDef core fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    class Query,Context,Answer core;
```

### Chi Tiết 3 Trụ Cột Đánh Giá:
1. **Context Relevance (Độ liên quan của ngữ cảnh):**
   - Đo lường mức độ "sạch" của các đoạn văn bản được bộ tìm kiếm kéo về. Nếu truy xuất 5 đoạn văn nhưng chỉ có 1 đoạn chứa câu trả lời, 4 đoạn còn lại là "rác ngữ cảnh" (Context Noise) làm xao nhãng LLM.
2. **Groundedness / Faithfulness (Độ trung thực & Không ảo giác):**
   - Thước đo sống còn: Tách câu trả lời thành từng luận điểm (Atomic Claims). Kiểm tra xem từng luận điểm có suy luận được logic từ ngữ cảnh hay không:
     $$\text{Faithfulness} = \frac{\text{Số lượng luận điểm được chứng minh bởi Context}}{\text{Tổng số luận điểm trong câu trả lời}}$$
   - Nếu $\text{Faithfulness} < 1.0 \implies$ Mô hình đang "bịa đặt" thông tin ngoài tài liệu (Hallucination Penalty)!
3. **Answer Relevance (Độ liên quan của câu trả lời):**
   - Đảm bảo mô hình không trả lời vòng vo hoặc lảng tránh câu hỏi của người dùng.

---

## 2. Tìm Kiếm Lai: Hybrid Search & Reciprocal Rank Fusion (RRF)

Chỉ dùng tìm kiếm vector (Dense Embeddings) sẽ gặp thất bại thảm hại khi người dùng tìm kiếm:
- Tên mã hiệu sản phẩm (ví dụ: `RH26-SEC-01`).
- Tên riêng, địa danh hiếm (ví dụ: `Huyện Cần Giờ`, `Subang Jaya`).
- Các từ khóa kỹ thuật viết tắt (`WPA2`, `CVE-2024-1234`).

### Kiến Trúc Tìm Kiếm Lai Tối Thượng (Dense + Sparse):
Kết hợp tìm kiếm từ khóa chính xác **BM25** (Sparse Retrieval) với tìm kiếm ngữ nghĩa sâu **BGE-M3 / Sentence-Transformers** (Dense Retrieval) thông qua công thức **RRF (Reciprocal Rank Fusion)**:

$$\text{RRF Score}(d) = \sum_{m \in \{\text{BM25}, \text{Dense}\}} \frac{1}{k + r_m(d)} \quad (k = 60)$$

```python
def reciprocal_rank_fusion(bm25_ranks: dict, dense_ranks: dict, k: int = 60) -> list:
    rrf_scores = {}
    all_doc_ids = set(bm25_ranks.keys()).union(set(dense_ranks.keys()))
    
    for doc_id in all_doc_ids:
        rank_bm25 = bm25_ranks.get(doc_id, 1000)
        rank_dense = dense_ranks.get(doc_id, 1000)
        
        score = (1.0 / (k + rank_bm25)) + (1.0 / (k + rank_dense))
        rrf_scores[doc_id] = score
        
    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
```

---

## 3. Tái Sắp Xếp Bằng Mô Hình Cross-Encoder (Re-Ranking)

Mô hình Bi-Encoder (như BGE-M3) tính toán vector của Query và Document một cách độc lập $\implies$ Rất nhanh nhưng bỏ lỡ mối tương tác tinh tế giữa các từ (Cross-Attention).

- **Chiến thuật 2 giai đoạn (Two-Stage Retrieval):**
  - **Stage 1 (Retrieval):** Dùng Hybrid Search kéo về Top 30 tài liệu ứng viên tiềm năng (trong 10ms).
  - **Stage 2 (Re-ranking):** Dùng mô hình Cross-Encoder (`bge-reranker-base` hoặc `ms-marco-MiniLM-L-6-v2`) nạp cặp `[Query, Document]` vào cùng một lúc để chấm điểm tương tác sâu, chọn ra đúng **Top 3 đoạn văn xuất sắc nhất** đưa vào prompt của LLM.

---

## 4. Kỹ Thuật Chuỗi Kiểm Chứng: Chain-of-Verification (CoVe - Meta AI)

Để ép mô hình tự loại bỏ ảo giác trước khi xuất câu trả lời cuối cùng:

```
[BƯỚC 1: DỰ THẢO SƠ BỘ (Baseline Draft)]
LLM sinh ra câu trả lời ban đầu dựa trên ngữ cảnh.

[BƯỚC 2: SINH CÂU HỎI KIỂM CHỨNG (Verification Questions)]
LLM tự phân tích bản dự thảo và đặt ra 3 câu hỏi chất vấn:
- Câu hỏi 1: "Con số doanh thu 50 tỷ có xuất hiện trong tài liệu không?"
- Câu hỏi 2: "Ai là người ký quyết định này?"

[BƯỚC 3: TRẢ LỜI ĐỘC LẬP TỪ TÀI LIỆU (Independent Fact-Checking)]
LLM trả lời từng câu hỏi kiểm chứng CHỈ DỰA VÀO TÀI LIỆU GỐC.

[BƯỚC 4: HIỆU CHÍNH BẢN CUỐI (Final Verified Response)]
LLM so sánh Bản dự thảo với Kết quả kiểm chứng:
- Nếu phát hiện con số 50 tỷ không có trong tài liệu -> Loại bỏ ngay lập tức!
- Xuất ra câu trả lời hoàn toàn chuẩn xác (100% Grounded).
```

---

## 5. Từ Chối Trả Lời Có Kiểm Soát (Conservative Abstention)

Trong thang điểm đánh giá của ban giám khảo: **Một câu trả lời sai lệch (Hallucination) sẽ bị trừ điểm nặng hơn nhiều so với việc mô hình dũng cảm thừa nhận mình không biết!**

### Kỹ Thuật Đặt Ngưỡng Tự Tin (Confidence Guard):
Nếu điểm số tương đồng tối đa của tài liệu được truy xuất $\text{Score}_{\text{max}} < \text{Threshold}$ (ví dụ $< 0.45$):
- Không đưa prompt vào LLM để ép nó đoán mò.
- Trả về ngay mẫu câu từ chối chuẩn mực:
  > *"Dựa trên các tài liệu được cung cấp, không có đủ cơ sở dữ liệu xác thực để trả lời câu hỏi này."*
- Giữ vững điểm số an toàn tuyệt đối trước các bẫy câu hỏi gài của ban giám khảo!
