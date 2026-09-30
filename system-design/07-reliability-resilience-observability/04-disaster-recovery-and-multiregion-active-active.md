# 04. Disaster Recovery & Multi-Region Active-Active

Khi toàn bộ một trung tâm dữ liệu (Datacenter / AWS Region) bị mất điện, lũ lụt, hoặc đứt cáp viễn thông quốc tế, doanh nghiệp cần một chiến lược khắc phục thảm họa (Disaster Recovery - DR) để bảo toàn dữ liệu và duy trì hoạt động kinh doanh liên tục (Business Continuity).

---

## 1. Hai Thước Đo Khắc Phục Thảm Họa Sống Còn: RPO & RTO

```mermaid
graph LR
    subgraph Dòng Thời Gian Xảy Ra Sự Cố
        A["Thời Điểm Bản Sao Lưu Gần Nhất (T_backup)"]
        B["THẢM HỌA XẢY RA! (T_disaster)"]
        C["HỆ THỐNG PHỤC HỒI HOÀN TOÀN (T_recovered)"]
    end
    
    A -->|RPO: Dữ liệu bị mất vĩnh viễn| B
    B -->|RTO: Thời gian hệ thống bị ngừng hoạt động (Downtime)| C
```

- **RPO (Recovery Point Objective - Mục tiêu điểm phục hồi):** Lượng dữ liệu tối đa chấp nhận bị mất mát (tính theo thời gian).
  - Ví dụ: Sao lưu DB mỗi đêm lúc 00:00. Nếu thảm họa xảy ra lúc 14:00 $\implies$ RPO = 14 giờ dữ liệu giao dịch bị mất.
- **RTO (Recovery Time Objective - Mục tiêu thời gian phục hồi):** Khoảng thời gian tối đa để hệ thống khôi phục hoạt động bình thường kể từ khi thảm họa xảy ra.
  - Ví dụ: Mất 45 phút để dựng lại cụm máy chủ và trỏ DNS $\implies$ RTO = 45 phút.

---

## 2. Bốn Cấp Độ Khắc Phục Thảm Họa (DR Strategies Matrix)

| Cấp độ | Cơ chế hoạt động | RPO | RTO | Chi phí vận hành |
| :--- | :--- | :--- | :--- | :--- |
| **1. Backup & Restore** | Tạo bản sao lưu định kỳ lên Cloud Storage (S3) ở vùng khác. Khi thảm họa xảy ra, tạo mới cụm máy chủ và nạp lại dữ liệu. | Hàng giờ / Hàng ngày | Hàng giờ / Hàng ngày | Cực thấp ($\$$) |
| **2. Pilot Light** | Dữ liệu cốt lõi (Database) được sao chép liên tục sang Region phụ. Các máy chủ ứng dụng (App Servers) ở trạng thái tắt, chỉ bật khi có thảm họa. | Vài chục giây đến vài phút | 10 - 30 phút | Thấp ($\$\$$) |
| **3. Warm Standby** | Region phụ chạy phiên bản thu nhỏ (Scaled-down, ví dụ $20\%$ năng lực). Khi có sự cố, kích hoạt Auto-scaling lên $100\%$. | Dưới 1 phút | Dưới 5 phút | Trung bình ($\$\$\$$) |
| **4. Multi-Region Active-Active** | Cả hai (hoặc nhiều) Region cùng nhận lưu lượng đọc và ghi thực tế từ người dùng toàn cầu đồng thời. | **Gần bằng 0 (Zero RPO)** | **Gần bằng 0 (Zero RTO)** | Cực cao ($\$\$\$\$\$$) |

---

## 3. Kiến Trúc Multi-Region Active-Active & Định Tuyến Toàn Cầu

```mermaid
graph TD
    UserAsia["Người Dùng Châu Á"] --> DNS["Global DNS Routing (Anycast / AWS Route53)"]
    UserUS["Người Dùng Châu Mỹ"] --> DNS
    
    DNS -->|Latency-based Routing| RegionAsia["Region Singapore (Active)"]
    DNS -->|Latency-based Routing| RegionUS["Region Virginia (Active)"]
    
    subgraph Region Singapore
        ALB1["App Load Balancer"]
        App1["App Microservices"]
        DB1[("Local Database Node 1")]
        ALB1 --> App1 --> DB1
    end
    
    subgraph Region Virginia
        ALB2["App Load Balancer"]
        App2["App Microservices"]
        DB2[("Local Database Node 2")]
        ALB2 --> App2 --> DB2
    end
    
    DB1 <===>|Bất đồng bộ Cross-Region Replication (CRR)| DB2
```

---

## 4. Xử Lý Xung Đột Dữ Liệu Đồng Thời (Conflict Resolution & CRDTs)

Trong kiến trúc Active-Active Multi-Region, độ trễ truyền ánh sáng xuyên đại dương (Mỹ sang Singapore $\approx 150-200$ms) khiến việc đồng bộ hóa khóa chặn phân tán (Synchronous Distributed Locks) trở nên bất khả thi vì quá chậm.

Các hệ thống phải ghi cục bộ trước (Local Write), sau đó nhân bản bất đồng bộ (Asynchronous Replication). Khi hai người dùng ở hai nửa bán cầu cùng sửa một bản ghi:

### 4.1 Last-Write-Wins (LWW)
- Bản ghi nào có Timestamp của máy chủ lớn hơn sẽ ghi đè bản ghi có Timestamp nhỏ hơn.
- **Hiểm họa tiềm ẩn:** Lệch đồng hồ phần cứng vật lý (Clock Drift do NTP) có thể khiến một bản ghi mới hơn trong thực tế bị đè mất bởi một bản ghi cũ hơn có đồng hồ chạy nhanh!

### 4.2 Cấu Trúc Dữ Liệu Tự Khử Xung Đột (CRDT - Conflict-free Replicated Data Types)
Được phát minh bởi Marc Shapiro et al. (được áp dụng trong Redis Enterprise, Apple Notes, Figma, Riak):
- Đảm bảo rằng dù các bản sao (Replicas) nhận các thao tác cập nhật theo thứ tự bất kỳ, khi toàn bộ các thao tác được truyền tới, **tất cả các bản sao sẽ tự động hội tụ về cùng một trạng thái duy nhất 100% mà không cần người điều phối trung tâm.**

#### Ví dụ Bộ Đếm Tăng Giảm Phân Tán (PN-Counter):
- Mỗi Region duy trì hai vector: $P$ (Positive - số lần tăng) và $N$ (Negative - số lần giảm).
- Khi tính tổng: $\text{Total} = \sum P - \sum N$.
- Khi đồng bộ hai Region:
  $$P_{\text{merged}}[i] = \max(P_1[i], P_2[i]), \quad N_{\text{merged}}[i] = \max(N_1[i], N_2[i])$$
- Phép toán $\max$ có tính chất giao hoán (Commutative), kết hợp (Associative), và lũy nhược (Idempotent), triệt tiêu hoàn toàn xung đột mạng!
