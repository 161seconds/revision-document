# Module 01: Core Principles, Scalability & Reliability

Chào mừng bạn đến với **Module 01: Core Principles, Scalability & Reliability**. Module này cung cấp nền tảng lý thuyết và mô phỏng thực hành các nguyên lý kiến trúc hệ thống phân tán cơ bản nhưng tối quan trọng nhất: mở rộng quy mô, tính sẵn sàng cao, các định lý nền tảng và thuật toán cân bằng tải.

---

## 📚 Danh Mục Bài Học

1. **[01-vertical-vs-horizontal-scaling.md](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/01-vertical-vs-horizontal-scaling.md)**:
   - Mở rộng quy mô chiều dọc (Scale-Up) vs chiều ngang (Scale-Out).
   - Điểm nghẽn phần cứng (CPU, Bus, Memory Contention) và chi phí theo cấp số mũ.
   - Commodity hardware, phân tán rủi ro và zero single point of failure (SPOF).

2. **[02-stateless-vs-stateful-architecture.md](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/02-stateless-vs-stateful-architecture.md)**:
   - Bản chất Stateless vs Stateful trong tầng ứng dụng (App Tier).
   - Session State Offloading: Redis Session Store vs JWT / Encrypted Client Cookies.
   - Session Affinity (Sticky Sessions) và rủi ro mất cân bằng tải.

3. **[03-availability-nines-sla-slo-sli.md](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/03-availability-nines-sla-slo-sli.md)**:
   - Các chữ số 9 của tính sẵn sàng (99.9% vs 99.99% vs 99.999%).
   - Phân biệt SLI (Indicator), SLO (Objective), SLA (Agreement) và Error Budget.
   - Tính toán độ sẵn sàng: Các thành phần nối tiếp (Series) vs song song (Parallel Redundancy).

4. **[04-cap-and-pacelc-theorems.md](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/04-cap-and-pacelc-theorems.md)**:
   - Định lý CAP (Consistency, Availability, Partition Tolerance).
   - Tại sao trong thực tế chỉ có sự lựa chọn giữa CP và AP (CA là bất khả thi trên mạng phân tán).
   - Định lý PACELC: Hành vi khi có phân vùng mạng ($P$) vs khi hệ thống bình thường ($E$).

5. **[05-load-balancing-and-consistent-hashing.md](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/05-load-balancing-and-consistent-hashing.md)**:
   - Cân bằng tải L4 (Transport) vs L7 (Application).
   - Các thuật toán: Round Robin, Weighted, Least Connections, IP Hash.
   - Vấn đề phân tán lại bộ nhớ cache khi dùng Modulo $K \pmod N$.
   - Giải pháp **Consistent Hashing Ring** và Virtual Nodes (vnodes).

---

## 🛠️ Thực Hành & Đánh Giá

- **Mô phỏng kiến trúc**: [load_balancer_simulator.mjs](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/load_balancer_simulator.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/01-core-principles-and-scalability/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node system-design/01-core-principles-and-scalability/practice.mjs
```
