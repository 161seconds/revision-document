# 07. Metrics Monitoring, Alerting & Time-Series DB (Prometheus / Grafana)

Một hệ thống giám sát chỉ số (Metrics Monitoring) và cảnh báo (Alerting) quy mô lớn cần xử lý hàng chục triệu điểm dữ liệu (Data points) mỗi giây từ hàng chục ngàn máy chủ, container, và microservices với độ trễ phản hồi chỉ vài giây.

---

## 1. Mô Hình Dữ Liệu Chuỗi Thời Gian (Time-Series Data Model)

Một chỉ số được định nghĩa bởi:
$$\text{Time-Series} = \langle \text{Metric Name}, \{\text{Label}_1 = \text{Val}_1, \dots\}, \text{Timestamp}, \text{Value (float64)} \rangle$$

Ví dụ:
```
http_requests_total{method="POST", handler="/checkout", status="500"} 42 @1711929600
```

- **Đặc thù khối lượng công việc (Workload Characteristics):**
  - **Ghi cực lớn (Ultra-Heavy Write):** Hàng triệu bản ghi mới được nối tiếp mỗi giây.
  - **Cập nhật gần như bằng 0 (Append-Only):** Dữ liệu đo đạc trong quá khứ là bất biến, không bao giờ UPDATE.
  - **Đọc theo khoảng thời gian (Range Queries):** Các bảng điều khiển Dashboard (Grafana) luôn truy vấn tổng hợp theo khoảng thời gian: "Tính độ trễ p99 của API thanh toán trong 3 giờ qua".

---

## 2. Kiến Trúc Thu Thập Dữ Liệu: Kéo (Pull) vs Đẩy (Push)

```mermaid
graph TD
    subgraph Pull Model (Prometheus)
        AppA["App Node A (Exposes /metrics)"]
        AppB["App Node B (Exposes /metrics)"]
        PromServer["Prometheus Server (Scrape Engine)"]
        PromServer -->|HTTP GET /metrics định kỳ 15s| AppA
        PromServer -->|HTTP GET /metrics định kỳ 15s| AppB
    end

    subgraph Push Model (StatsD / OpenTelemetry / Datadog)
        AppC["Serverless Lambda / Cron Job"]
        Collector["OpenTelemetry Collector / Gateway"]
        AppC -->|UDP / gRPC Push| Collector
    end
```

| Tiêu chí | Mô hình Kéo (Pull - Prometheus) | Mô hình Đẩy (Push - StatsD / Datadog) |
| :--- | :--- | :--- |
| **Kiểm soát lưu lượng** | **Chủ động:** Máy chủ giám sát tự quyết định tần suất quét (Scrape interval). Không bao giờ bị client làm tràn ngập (DDoS). | **Bị động:** Nếu có 10.000 worker khởi động cùng lúc, khối lượng push ồ ạt có thể đánh sập máy chủ giám sát. |
| **Phát hiện máy chủ chết (Health Check)** | Tự nhiên: Nếu kéo thất bại liên tiếp 3 lần $\implies$ Đánh dấu máy chủ DOWN. | Khó khăn: Không phân biệt được máy chủ chết hay máy chủ rảnh không có gì để gửi. |
| **Tác vụ ngắn hạn (Short-lived Jobs)** | Khó quét nếu container chạy và tắt trong 2 giây (Cần dùng thêm Prometheus Pushgateway). | Rất tối ưu: Phù hợp tự nhiên với AWS Lambda, Kubernetes batch jobs. |

---

## 3. Kỹ Thuật Nén Dữ Liệu Trong TSDB (Gorilla Compression)

Facebook đã xuất bản bài báo khoa học kinh điển về công cụ **Gorilla TSDB**, hiện được Prometheus và InfluxDB áp dụng:
1. **Nén Timestamp (Delta-of-Delta Encoding):**
   - Hầu hết các mẫu đo đều đến theo chu kỳ đều đặn (ví dụ mỗi 15 giây).
   - Thay vì lưu timestamp đầy đủ 64-bit ($t_1, t_2, t_3$), thuật toán lưu khoảng cách $\Delta_1 = t_1 - t_0$, sau đó lưu độ sai lệch của khoảng cách $D = \Delta_2 - \Delta_1$.
   - Nếu dữ liệu đến đúng giờ, $D = 0$, chỉ tốn đúng **1 bit** để lưu trữ!
2. **Nén Giá Trị Float64 (XOR Floating Point Compression):**
   - Chỉ số hệ thống (CPU usage, Memory) ít khi thay đổi đột ngột giữa hai giây liên tiếp.
   - Lấy giá trị hiện tại XOR với giá trị trước đó. Nếu giống nhau, kết quả XOR ra 0 (tốn 1 bit).

---

## 4. Quá Trình Giảm Mẫu (Downsampling & Rollups)

Không cần thiết phải lưu giữ dữ liệu chi tiết từng giây của tháng trước trong đĩa NVMe đắt đỏ:
- **Dữ liệu 0 - 7 ngày:** Độ phân giải gốc 10 giây (Raw Data).
- **Dữ liệu 8 - 30 ngày:** Giảm mẫu (Downsample) thành trung bình 1 phút (1m Rollup: Min, Max, Avg, Count).
- **Dữ liệu > 30 ngày:** Giảm mẫu thành 1 giờ (1h Rollup) và đẩy vào Cloud Object Storage (S3 Cold Tier).
