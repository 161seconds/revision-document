# Module 08: System Design Interview Blueprint & Estimation Framework

Chào mừng bạn đến với **Module 08: System Design Interview Blueprint & Estimation Framework**. Đây là cẩm nang tổng hợp các phương pháp luận, quy chuẩn đánh giá, công thức ước lượng và ma trận quyết định chọn công nghệ dành riêng cho các kỳ thi phỏng vấn kiến trúc sư hệ thống cấp cao (Staff / Principal Architect).

---

## 📚 Danh Mục Bài Học

1. **[01-the-4-step-system-design-interview-framework.md](file:///d:/my-project/revision-document/system-design/08-interview-framework-and-estimation/01-the-4-step-system-design-interview-framework.md)**:
   - Khung 4 bước chuẩn mực phân bổ 45 phút phỏng vấn.
   - Bước 1: Làm rõ yêu cầu chức năng & phi chức năng, quy mô DAU, SLA độ trễ.
   - Bước 2: Thiết kế API và mô hình thực thể dữ liệu cấp cao.
   - Bước 3: Đào sâu 2-3 nút thắt cổ chai phức tạp nhất (Fanout, Sharding, Caching).
   - Bước 4: Khắc phục điểm lỗi đơn lẻ (SPOF), giám sát khả năng quan sát (Observability).
   - Bảng các lỗi tối kỵ (Red Flags) khiến ứng viên bị trượt.

2. **[02-back-of-the-envelope-estimation-master-guide.md](file:///d:/my-project/revision-document/system-design/08-interview-framework-and-estimation/02-back-of-the-envelope-estimation-master-guide.md)**:
   - Bảng quy đổi lũy thừa của 2 và hằng số thời gian vàng ($1\text{ ngày} \approx 10^5\text{ giây}$).
   - Công thức tính QPS, Peak QPS, Băng thông mạng Ingress / Egress (MB/s và Gbps).
   - Công thức tính dung lượng lưu trữ 5 năm kèm hệ số dự phòng và nhân bản.
   - Ước lượng RAM cho bộ nhớ đệm Cache theo quy luật Pareto 80/20.
   - Ví dụ thực chiến đầy đủ: Thiết kế hệ thống xem video YouTube / TikTok quy mô 500M DAU.

3. **[03-architecture-patterns-and-cheat-sheets.md](file:///d:/my-project/revision-document/system-design/08-interview-framework-and-estimation/03-architecture-patterns-and-cheat-sheets.md)**:
   - Cây quyết định chọn Cơ sở dữ liệu: Relational vs Key-Value vs Document vs Wide-Column vs Graph vs Time-Series vs Search.
   - Ma trận chọn công nghệ truyền tin phân tán (Task Queue vs Event Streaming vs Ephemeral Pub/Sub).
   - Ma trận so sánh chiến lược Caching (Cache-aside, Write-through, Write-behind).
   - Phân cấp mức độ nhất quán dữ liệu từ Linearizability đến Eventual Consistency.

---

## 🛠️ Thực Hành & Đánh Giá

- **Công cụ tính toán ước lượng quy mô**: [estimation_calculator.mjs](file:///d:/my-project/revision-document/system-design/08-interview-framework-and-estimation/estimation_calculator.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/08-interview-framework-and-estimation/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node system-design/08-interview-framework-and-estimation/practice.mjs
```
