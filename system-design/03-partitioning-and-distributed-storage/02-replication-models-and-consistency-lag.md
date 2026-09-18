# Replication Models & Consistency Anomalies

Replication (Nhân bản dữ liệu) là kỹ thuật lưu giữ các bản sao giống nhau của cùng một tập dữ liệu trên nhiều máy chủ độc lập nhằm tăng tính sẵn sàng (HA), giảm độ trễ đọc địa lý và nâng cao năng lực chịu tải.

---

## 1. Các Mô Hình Nhân Bản Cốt Lõi

```mermaid
graph TD
    subgraph SingleLeader [1. Single-Leader / Master-Replica]
        ClientW[Write Request] --> Leader[Leader / Master]
        Leader -->|Replication Stream| Follower1[Follower 1 (Read)]
        Leader -->|Replication Stream| Follower2[Follower 2 (Read)]
        ClientR[Read Request] --> Follower1
    end

    subgraph MultiLeader [2. Multi-Leader / Active-Active]
        DC1[Datacenter US-East<br/>Leader 1] <-->|Async Cross-DC Sync| DC2[Datacenter EU-West<br/>Leader 2]
    end

    subgraph Leaderless [3. Leaderless / Dynamo-Style]
        Client[Client Coordinator] --> N1[Node 1]
        Client --> N2[Node 2]
        Client --> N3[Node 3]
    end
```

### 1.1 Single-Leader Replication (Master-Slave)
- Mọi thao tác **Ghi (Write)** bắt buộc phải đi qua 1 node Leader duy nhất.
- Leader ghi vào local storage, sau đó gửi nhật ký thay đổi (*Replication Log / Binlog*) tới các node Follower.
- Các thao tác **Đọc (Read)** có thể thực hiện trên bất kỳ Follower nào.
- **Chế độ nhân bản**:
  - *Synchronous*: Leader chờ tất cả follower xác nhận đã ghi xong mới báo thành công cho client. (Chậm nhất, an toàn nhất).
  - *Asynchronous*: Leader báo thành công ngay khi ghi xong local. (Nhanh nhất, rủi ro mất dữ liệu nếu Leader chết trước khi sync).
  - *Semi-synchronous*: Chờ ít nhất 1 Follower xác nhận.

### 1.2 Multi-Leader Replication (Active-Active)
- Thường triển khai trên nhiều Trung tâm Dữ liệu (Multi-Datacenter). Mỗi Datacenter có 1 Leader riêng xử lý ghi cục bộ để giảm độ trễ mạng liên lục địa.
- **Xử lý xung đột ghi (Write Conflict Resolution)**:
  - *Last Write Wins (LWW)*: Dựa trên wall-clock timestamp. Dễ mất dữ liệu do hiện tượng lệch đồng hồ (*Clock Skew*).
  - *Conflict-free Replicated Data Types (CRDTs)*: Cấu trúc dữ liệu tự động giải quyết xung đột toán học (ví dụ: PN-Counter, G-Set).

### 1.3 Leaderless Replication (Dynamo-Style)
- Không có node nào là Leader. Client gửi đồng thời yêu cầu ghi và đọc tới $N$ nodes.
- **Toán Học Quorum (Túc Số)**:
  - $N$ = Tổng số replica lưu trữ bản sao của key.
  - $W$ = Số node tối thiểu phải xác nhận ghi thành công.
  - $R$ = Số node tối thiểu phải phản hồi khi đọc dữ liệu.

$$\mathbf{R + W > N} \implies \text{Đảm bảo Strong Consistency (Ít nhất 1 node trả về dữ liệu mới nhất)}$$

---

## 2. Các Hiện Tượng Bất Thường Do Replication Lag (Trễ Nhân Bản)

Trong mô hình Asynchronous Replication, follower luôn cập nhật chậm hơn Leader một khoảng thời gian $\Delta t$ (*Replication Lag*). Điều này tạo ra các dị thường kinh điển:

### 2.1 Vi Phạm "Read-Your-Writes Consistency"
- **Tình huống**: Người dùng đăng một status mới lên mạng xã hội. Request ghi vào Leader thành công. Sau đó người dùng bấm F5 reload trang; request đọc được chuyển sang Follower đang bị lag.
- **Kết quả**: Người dùng không thấy bài đăng vừa viết của mình! Họ tưởng hệ thống lỗi và đăng lại lần thứ 2 gây trùng lặp.
- **Giải pháp**:
  - Dữ liệu do chính người dùng đó sửa đổi (ví dụ: Profile của tôi) luôn được **đọc trực tiếp từ Leader** trong vòng 10 giây đầu tiên sau khi ghi.

### 2.2 Vi Phạm "Monotonic Reads" (Thời Gian Quay Ngược)
- **Tình huống**: Người dùng đọc dữ liệu từ Follower A (đã sync tới sự kiện số 100). Sau đó người dùng reload trang; Load Balancer điều phối request đọc tiếp theo sang Follower B (đang bị lag, mới chỉ sync tới sự kiện số 95).
- **Kết quả**: Người dùng thấy dữ liệu đang có đột nhiên biến mất, như thể thời gian bị quay ngược về quá khứ.
- **Giải pháp**: Đảm bảo mỗi người dùng luôn được đọc từ cùng một replica (User-based Sticky Replica Routing).
