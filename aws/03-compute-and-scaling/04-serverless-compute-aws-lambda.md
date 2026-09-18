# 04. Serverless Compute: AWS Lambda

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. EC2 Instance Types & Pricing Models](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/01-ec2-instance-types-and-pricing-models.md).
- **Module hiện tại**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 04: Storage & Databases (S3, EBS, RDS, DynamoDB)](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Triết Lý Serverless & Firecracker MicroVM
- **Serverless không có nghĩa là không có server**, mà là bạn **hoàn toàn không phải quản trị server**:
  - Không cần quản lý hệ điều hành, không vá lỗi kernel, không cấu hình Auto Scaling.
  - Tự động co giãn từ 0 lên hàng ngàn hàm song song chỉ trong vài giây.
  - **Mô hình tính tiền theo mức sử dụng thực tế**: Nếu không có request nào, hóa đơn là **$0 USD**.
- **Công nghệ nền tảng**: AWS sử dụng công nghệ ảo hóa siêu nhẹ nguồn mở do chính AWS phát triển là **Firecracker MicroVM**, cho phép khởi tạo một môi trường máy ảo an toàn chỉ trong vòng **vài chục mili-giây**.

### 2.2 Vòng Đời Thực Thi: Cold Start vs Warm Start
Khi một request kích hoạt hàm Lambda:

```
[ 1. COLD START (Chỉ xảy ra khi chưa có container sẵn hoặc khi scale thêm) ]
Tải Code từ S3 ──> Khởi tạo Firecracker MicroVM ──> Nạp Runtime (Node/Java/.NET) ──> Chạy Code Ngoài Handler
                                                                                               ↓
[ 2. WARM START (Tái sử dụng container cho các request tiếp theo) ]
Thực thi trực tiếp Function Handler ──> Đóng băng (Freeze) Container chờ request kế tiếp
```

> [!TIP]
> **Kỹ Thuật Tối Ưu Code Sống Còn: Tái Sử Dụng Execution Context**
> Khởi tạo kết nối Cơ sở dữ liệu (Database Connection Pool), nạp SDK clients (AWS SDK S3/DynamoDB) **BÊN NGOÀI FUNCTION HANDLER**:
> ```javascript
> // Khởi tạo 1 lần duy nhất lúc Cold Start, tái sử dụng qua hàng triệu Warm Invocations!
> const dbClient = new DatabaseClient(process.env.DB_URL);
> 
> export const handler = async (event) => {
>     return await dbClient.query('SELECT * FROM users');
> };
> ```

---

## 3. Cấu Hình & Quản Lý Concurrency

### 3.1 Cấu Hình Kích Thước (Tỉ Lệ RAM và CPU)
- Bộ nhớ RAM cấu hình từ **$128\text{ MB}$ đến $10,240\text{ MB}$ ($10\text{ GB}$)**.
- **CPU không thể cấu hình độc lập**: AWS tự động cấp phát công suất CPU tỉ lệ thuận với RAM. Tại mốc **$1,769\text{ MB}$ RAM**, bạn nhận được chính xác **1 vCPU đầy đủ**. Trên ngưỡng đó, hàm được mở khóa đa luồng (Multi-threading).
- **Thư mục đệm `/tmp`**: Dung lượng từ $512\text{ MB}$ đến $10\text{ GB}$ để lưu file tạm.
- **Thời gian chạy tối đa (Timeout)**: **15 phút ($900\text{ giây}$)**. Không phù hợp cho các batch job dài hàng giờ.

### 3.2 Ba Chế Độ Concurrency (Đồng Thời)
1. **Unreserved Concurrency (Dùng chung)**: Mặc định chia sẻ trong hạn mức $1,000$ concurrent executions của toàn bộ tài khoản trong Region.
2. **Reserved Concurrency (Bảo lưu & Giới hạn trần)**: Đảm bảo một hàm luôn có sẵn tối đa N slots, đồng thời ngăn chặn hàm đó chiếm dụng hết quota của các hàm khác trong tài khoản.
3. **Provisioned Concurrency (Xóa bỏ Cold Start)**: Khởi tạo sẵn một số lượng container luôn ở trạng thái "ấm" (Pre-warmed), đảm bảo độ trễ phản hồi tính bằng mili-giây cho các API thanh toán quan trọng.

---

## 4. Ba Mô Hình Kích Hoạt (Invocation Models)

| Mô hình | Nguồn kích hoạt điển hình | Xử lý lỗi & Retry |
| :--- | :--- | :--- |
| **Đồng bộ (Synchronous)** | API Gateway, Application Load Balancer, Cognito | Client tự chịu trách nhiệm retry. Client chờ nhận kết quả trả về. |
| **Bất đồng bộ (Asynchronous)** | Amazon S3, SNS, EventBridge | Lambda tự động retry 2 lần nếu fail. Hỗ trợ đẩy sự kiện lỗi vào **Dead Letter Queue (DLQ)** hoặc **Lambda Destinations**. |
| **Thăm dò luồng (Polling / Stream)** | Amazon SQS, Kinesis Data Streams, DynamoDB Streams | Lambda liên tục poll theo lô (Batch). Nếu lỗi, chặn luồng hoặc chia nhỏ batch để xử lý lại. |

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quá Tải Cơ Sở Dữ Liệu Quan Hệ (RDS Connection Exhaustion)**
> Nếu có đợt sóng traffic khiến Lambda tự động scale lên 1,000 hàm đồng thời, mỗi hàm mở 5 kết nối tới PostgreSQL $\rightarrow$ $5,000$ connections đồng loạt đổ vào khiến cơ sở dữ liệu bị cạn kiệt RAM và sập hoàn toàn!
> - **Giải pháp**: Luôn đặt **Amazon RDS Proxy** ở giữa Lambda và Database để gom và tái sử dụng connection pool.

> [!WARNING]
> **Bẫy 2: Lambda Gọi Đệ Quy Vô Tận (Recursive Invocation Storm)**
> Viết hàm Lambda được kích hoạt khi có file tải lên S3, và bên trong hàm lại ghi một file mới vào chính S3 Bucket đó $\rightarrow$ Tạo vòng lặp kích hoạt vô tận hàng triệu lần trong vài phút, tiêu tốn hàng nghìn USD!
> - **Quy tắc**: Luôn ghi file đầu ra sang một Bucket khác hoặc cấu hình EventBridge filter prefix/suffix chặt chẽ.

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Làm thế nào để loại bỏ hoàn toàn Cold Start trong AWS Lambda?**
   - *Trả lời*: Kích hoạt tính năng **Provisioned Concurrency**. AWS sẽ phân bổ và khởi chạy sẵn các microVM với đầy đủ runtime và code đã nạp sẵn trong bộ nhớ, sẵn sàng tiếp nhận request với độ trễ phản hồi ngay lập tức ($< 10\text{ ms}$).
2. **Công thức tính toán chi phí thực thi của AWS Lambda là gì?**
   - *Trả lời*: Dựa trên số lượng Invocations ( $\$0.20$ mỗi 1 triệu requests) và tài nguyên tiêu thụ tính theo đơn vị **Gigabyte-Seconds (GB-s)**:
     $$\text{Chi phí} = \text{Dung lượng RAM (GB)} \times \text{Thời gian chạy (giây)} \times \text{Đơn giá GB-s}$$
3. **AWS Hyperplane giải quyết vấn đề gì khi Lambda cần truy cập tài nguyên trong VPC (như RDS)?**
   - *Trả lời*: Trước năm 2019, mỗi lần Lambda scale trong VPC, nó phải tạo một card mạng ENI mới tốn từ 10 đến 30 giây (khiến Cold Start cực kỳ kinh hoàng). Kiến trúc AWS Hyperplane hiện đại tạo sẵn các ENI dùng chung ở cấp độ Subnet, giúp Lambda kết nối vào VPC chỉ mất chưa tới 1 mili-giây, xóa bỏ hoàn toàn độ trễ gắn ENI khi xưa.
