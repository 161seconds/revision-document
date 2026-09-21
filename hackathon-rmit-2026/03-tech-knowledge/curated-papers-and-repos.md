# Tổng Hợp Kho Học Liệu, Bài Báo Nghiên Cứu & Repositories Chính Thức
> Dành cho đội thi RMIT Hackathon 2026 - Tổng hợp toàn bộ tài nguyên học thuật và công cụ mã nguồn mở.

---

## 1. Các Bài Báo Nghiên Cứu Đỉnh Cao (Must-Read Papers)

1. **[Multilingual Jailbreak Challenges in Large Language Models (ICLR 2024)](https://openreview.net/forum?id=Yp3h26wQ6E)**  
   *Tác giả: Yue Deng et al. (DAMO Academy, Alibaba)*  
   *Ý nghĩa*: Bài báo chỉ ra rằng các LLM thương mại (GPT-4, Claude) có thể dễ dàng bị bẻ khóa (jailbreak) thông qua các ngôn ngữ ít tài nguyên do hiện tượng "Safety Alignment Gap". Giới thiệu bộ benchmark **MultiJail**.
2. **[BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation (arXiv:2402.03216)](https://arxiv.org/abs/2402.03216)**  
   *Tác giả: Jianlyu Chen et al. (BAAI)*  
   *Ý nghĩa*: Kiến trúc mô hình embedding đa ngôn ngữ số 1 thế giới hiện nay, kết hợp đồng thời Dense Retrieval, Lexical/Sparse Matching, và ColBERT Multi-vector.
3. **[Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations](https://arxiv.org/abs/2312.06674) & [Llama Guard 3 Technical Report](https://github.com/meta-llama/PurpleLlama)**  
   *Tác giả: Meta AI*  
   *Ý nghĩa*: Kiến trúc phân loại an toàn theo chuẩn MLCommons Hazard Taxonomy, tối ưu cho các thiết bị biên và GPU nhỏ.
4. **[Multi-turn Context-Aware Prompt Injection in RAG Systems](https://arxiv.org/abs/2403.04786)**  
   *Ý nghĩa*: Cách các payload tấn công gián tiếp (Indirect Prompt Injection) lây nhiễm vào ngữ cảnh RAG và cách phòng vệ.

---

## 2. Các GitHub Repositories Chuẩn Mực (Official Repos)

| Tên Repository | Link GitHub | Công dụng thực tế trong cuộc thi |
| :--- | :--- | :--- |
| **`FlagEmbedding (BGE-M3)`** | [FlagOpen/FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding) | Mã nguồn chính thức của BGE-M3, BGE-Reranker-v2-m3. |
| **`DAMO Multilingual Safety`** | [DAMO-NLP-SG/multilingual-safety-for-LLMs](https://github.com/DAMO-NLP-SG/multilingual-safety-for-LLMs) | Bộ dữ liệu MultiJail gồm các prompt tấn công bằng nhiều ngôn ngữ. |
| **`Awesome LLM Jailbreak Papers`** | [WhileBug/AwesomeLLMJailBreakPapers](https://github.com/WhileBug/AwesomeLLMJailBreakPapers) | Tuyển tập đầy đủ nhất các phương pháp jailbreak, roleplay, cipher attack. |
| **`Microsoft PyRIT`** | [Azure/PyRIT](https://github.com/Azure/PyRIT) | Framework tự động hóa Red-Teaming chuyên nghiệp của Microsoft. |
| **`garak`** | [leondz/garak](https://github.com/leondz/garak) | Trình quét lỗ hổng LLM tự động (hỗ trợ prompt injection, data leak). |
| **`Outlines`** | [dottxt-ai/outlines](https://github.com/dottxt-ai/outlines) | Thư viện ép cấu trúc đầu ra JSON/Regex cho LLM, chống prompt injection. |
| **`Meta PurpleLlama`** | [meta-llama/PurpleLlama](https://github.com/meta-llama/PurpleLlama) | Bộ công cụ an toàn AI của Meta (chứa mã nguồn Llama Guard 3, CyberSec Eval). |

---

## 3. Các Bộ Dữ Liệu Tham Khảo (Public Datasets)

* **MultiJail Dataset**: Tập hợp các câu hỏi cấm được dịch và bản địa hóa sang nhiều ngôn ngữ để kiểm thử độ bền bỉ an toàn của LLM.
* **Anthropic Red Teaming Dataset**: Dữ liệu các cuộc hội thoại jailbreak do con người thực hiện để khám phá hành vi không an toàn.
* **OWASP LLM Vulnerability Examples**: Các mẫu payload thực tế về Direct/Indirect Prompt Injection.
