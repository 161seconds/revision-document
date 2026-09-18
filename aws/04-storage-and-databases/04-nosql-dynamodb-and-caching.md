# 04. NoSQL: Amazon DynamoDB & Caching (DAX & ElastiCache)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [03. RDS, Aurora & Database Scaling](file:///d:/my-project/revision-document/aws/04-storage-and-databases/03-rds-aurora-and-database-scaling.md), [Database Architecture](file:///d:/my-project/revision-document/database/).
- **Module hiện tại**: [Module 04: Storage & Databases](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 05: Messaging, Observability & IaC](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Amazon DynamoDB - Cơ Sở Dữ Liệu NoSQL Serverless
- Cơ sở dữ liệu phân tán Key-Value và Document có khả năng mở rộng không giới hạn:
  - Cam kết độ trễ phản hồi ổn định ở mức **vài mili-giây đơn vị (Single-digit millisecond)** ở mọi quy mô (từ $10$ đến $10,000,000\text{ requests/giây}$).
  - Không cần quản lý cụm máy chủ, không cần bảo trì chỉ mục thủ công, tự động nhân bản dữ liệu qua 3 Availability Zones.

### 2.2 Kiến Trúc Khóa Chính (Primary Key Architecture)
1. **Simple Primary Key (Chỉ gồm Partition Key - PK)**:
   - Dùng hàm băm nội bộ (Hash Function) để quyết định mục dữ liệu sẽ nằm trên phân vùng vật lý (Physical Partition) nào.
   - Các Partition Key phải có tính phân tán cao (High Cardinality) như `UserId`, `OrderId` để tránh hiện tượng **"Hot Partition"**.
2. **Composite Primary Key (Partition Key + Sort Key - SK)**:
   - Tất cả các item có cùng Partition Key sẽ được lưu trữ vật lý trên **cùng một phân vùng** và được **sắp xếp theo thứ tự của Sort Key**.
   - Cho phép thực hiện các truy vấn dải (Range Queries): `BETWEEN`, `<`, `>`, `begins_with`.

### 2.3 So Sánh Secondary Indexes: LSI vs GSI
| Tiêu chí | Local Secondary Index (LSI) | Global Secondary Index (GSI) |
| :--- | :--- | :--- |
| **Cấu trúc khóa** | **Cùng PK**, khác Sort Key | **Khác PK**, khác Sort Key |
| **Thời điểm tạo** | **Bắt buộc phải tạo lúc tạo bảng** (Không thể thêm sau) | **Có thể tạo, sửa hoặc xóa bất kỳ lúc nào** |
| **Dung lượng phân vùng** | Bị giới hạn tối đa $10\text{ GB}$ cho mỗi PK | **Không giới hạn dung lượng** |
| **Năng lực RCU/WCU** | Dùng chung RCU/WCU với bảng chính | **Sở hữu RCU/WCU riêng biệt độc lập** |
| **Tính nhất quán** | Hỗ trợ cả Eventual và Strong Consistency | **Chỉ hỗ trợ Eventually Consistent** |

---

## 3. Toán Học Tính Toán Năng Lực (RCU & WCU Mathematics)

Hầu như mọi kỳ thi chứng chỉ và phỏng vấn AWS cấp cao đều yêu cầu tính toán chính xác công thức này:

### 3.1 Read Capacity Unit (RCU) - Đơn Vị Đọc
- **$1\text{ RCU}$** = **$1\text{ lần Đọc Nhất Quán Mạnh (Strongly Consistent Read)}$** mỗi giây cho một item có kích thước tối đa **$4\text{ KB}$**.
- **$1\text{ RCU}$** = **$2\text{ lần Đọc Nhất Quán Sau (Eventually Consistent Read)}$** mỗi giây cho một item tối đa $4\text{ KB}$ (Đọc eventual rẻ hơn $50\%$).
- **$2\text{ RCU}$** = $1$ lần Đọc Giao dịch (Transactional Read) mỗi giây cho item tối đa $4\text{ KB}$.

$$\text{Số RCU (Strong)} = \left\lceil \frac{\text{Kích thước Item (KB)}}{4\text{ KB}} \right\rceil \times \text{Số Reads mỗi giây}$$
$$\text{Số RCU (Eventual)} = \frac{\text{Số RCU (Strong)}}{2}$$

### 3.2 Write Capacity Unit (WCU) - Đơn Vị Ghi
- **$1\text{ WCU}$** = **$1\text{ lần Ghi}$** mỗi giây cho một item có kích thước tối đa **$1\text{ KB}$**.
- **$2\text{ WCU}$** = $1$ lần Ghi Giao dịch (Transactional Write) mỗi giây cho item tối đa $1\text{ KB}$.

$$\text{Số WCU} = \lceil \text{Kích thước Item (KB)} \rceil \times \text{Số Writes mỗi giây}$$

*Ví dụ thực tế*: Bạn cần đọc $100$ items/giây, mỗi item nặng $6\text{ KB}$, sử dụng chế độ Strongly Consistent Read:
$$\left\lceil \frac{6\text{ KB}}{4\text{ KB}} \right\rceil = 2 \implies 2 \times 100 = \mathbf{200\text{ RCUs}}$$

---

## 4. Tăng Tốc Với Bộ Nhớ Đệm: DAX vs ElastiCache

- **DynamoDB Accelerator (DAX)**:
  - Cụm cache In-Memory chuyên dụng tích hợp sẵn cho DynamoDB.
  - Giảm độ trễ đọc từ mili-giây xuống **micro-giây ($< 1\text{ ms}$)**.
  - Không cần sửa code nghiệp vụ: Chỉ cần trỏ SDK vào DAX Endpoint thay vì DynamoDB.
- **Amazon ElastiCache**:
  - Dịch vụ in-memory database độc lập: **Redis** (hỗ trợ Data Structures, Pub/Sub, Multi-AZ Cluster) hoặc **Memcached** (caching đơn giản, đa luồng).

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Hiện Tượng Bóp Nghẹt Tải (Throttling) Do Hot Partition**
> Nếu bạn chọn Partition Key có ít giá trị (vd: `Country` chỉ có vài nước, hoặc `Gender` chỉ có 2 giá trị), hàng triệu request sẽ đổ dồn vào đúng một phân vùng vật lý duy nhất, làm vượt quá giới hạn $1,000\text{ WCU}$ hoặc $3,000\text{ RCU}$ của phân vùng đó và ném lỗi `ProvisionedThroughputExceededException`!
> - **Giải pháp**: Chọn Partition Key có độ phân tán cao (UUID, UserID), hoặc kỹ thuật "Write Sharding" (thêm số ngẫu nhiên vào đuôi key).

> [!WARNING]
> **Bẫy 2: Lạm Dụng Lệnh `Scan` Thay Vì `Query`**
> - `Query`: Tìm kiếm mục tiêu bằng Partition Key, chỉ duyệt đúng dữ liệu cần tìm, tốn cực ít RCU.
> - `Scan`: Quét tuần tự toàn bộ từng dòng trong toàn bộ bảng hàng triệu records rồi mới lọc! `Scan` tiêu tốn sạch toàn bộ RCU của bảng, làm nghẽn hệ thống và đội chi phí lên hàng ngàn USD!

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **DynamoDB Streams có tác dụng gì trong kiến trúc hướng sự kiện (Event-Driven)?**
   - *Trả lời*: DynamoDB Streams là cơ chế Change Data Capture (CDC) ghi nhận theo thời gian thực mọi thao tác `INSERT`, `MODIFY`, `REMOVE` trên bảng. Stream này có thể kích hoạt trực tiếp hàm AWS Lambda để thực hiện các tác vụ phái sinh (như cập nhật ElasticSearch index, gửi email thông báo, hoặc đồng bộ dữ liệu sang cơ sở dữ liệu phân tích).
2. **Tại sao việc thiếu RCU/WCU trên một Global Secondary Index (GSI) có thể làm chậm cả bảng chính?**
   - *Trả lời*: Mặc dù GSI có RCU/WCU riêng, nhưng khi một item mới được ghi vào bảng chính, DynamoDB phải tự động cập nhật bản ghi đó vào GSI. Nếu GSI bị thiếu WCU và bị throttled, **toàn bộ thao tác ghi trên bảng chính cũng sẽ bị chặn lại và ném lỗi**, gây gián đoạn ứng dụng!
3. **Khi nào nên chọn chế độ On-Demand thay vì Provisioned Mode trong DynamoDB?**
   - *Trả lời*: Chọn **On-Demand** khi ứng dụng mới phát triển, lưu lượng truy cập không thể dự đoán trước hoặc có những đợt tăng vọt ngắn ngủi (Spiky traffic) khó lường trước. Chọn **Provisioned Mode** khi hệ thống đã có lưu lượng ổn định, giúp dễ dàng dự toán ngân sách và có thể bật Auto Scaling để tối ưu chi phí.
