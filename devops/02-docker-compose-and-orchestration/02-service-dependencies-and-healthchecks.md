# 02. Service Dependencies & Healthchecks

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Compose File Specification v3](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/01-compose-file-specification-v3.md).
- **Module hiện tại**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [03. Multi-tier Networking & Isolation](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/03-multi-tier-networking-and-isolation.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bẫy Tử Huyệt Của `depends_on` Truyền Thống
Trong nhiều năm, lập trình viên cấu hình Compose như sau:
```yaml
services:
  api:
    image: my-api
    depends_on:
      - db
```
- **Bản chất**: `depends_on` dạng danh sách chỉ báo cho Docker biết: "Hãy gọi lệnh `docker run` cho container `db` trước khi gọi `docker run` cho container `api`".
- **Vấn đề**: Ngay khi tiến trình `postgres` vừa khởi động, nó mất từ 3 đến 10 giây để:
  1. Nạp tệp cấu hình.
  2. Khởi tạo cluster dữ liệu.
  3. Mở cổng TCP 5432 để lắng nghe kết nối.
- **Hậu quả**: Container `api` khởi động quá nhanh, cố gắng kết nối tới port 5432 khi Postgres chưa sẵn sàng $\rightarrow$ Ném lỗi `Connection Refused` hoặc `ECONNREFUSED` và crash sập container!

### 2.2 Giải Pháp Chuẩn Mực: `condition: service_healthy`
Docker Compose v2/v3 cung cấp cơ chế kiểm tra sức khỏe (`healthcheck`) kết hợp với điều kiện phụ thuộc (`condition: service_healthy`).
Container `api` sẽ được giữ ở trạng thái chờ (Holding state), chỉ khởi chạy khi và chỉ khi container `db` chuyển sang trạng thái **`healthy`**.

---

## 3. Cấu Trúc Khai Báo Chi Tiết Một Healthcheck

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d appdb || exit 1"]
  interval: 5s       # Kiểm tra định kỳ mỗi 5 giây
  timeout: 3s        # Quá 3 giây coi như 1 lần thất bại
  retries: 5         # Thất bại 5 lần liên tiếp mới đánh dấu là 'unhealthy'
  start_period: 10s  # Thời gian ân hạn ban đầu: Các lần fail trong 10s này không tính vào retries
```

---

## 4. Code Mẫu Chuẩn Mực: Đồng Bộ Khởi Động Với Healthcheck

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_URL=postgresql://postgres:SecretPassword123@database:5432/appdb
    # Chỉ khởi chạy API khi Database và Redis đều đã sẵn sàng 100%
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
    networks:
      - app-network

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: SecretPassword123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 3s
      timeout: 3s
      retries: 5
      start_period: 5s
    networks:
      - app-network

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 2s
      retries: 3
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao việc dùng script chờ đợi như `wait-for-it.sh` ngày nay được xem là giải pháp phụ so với Docker Healthcheck?**
   - *Trả lời*: `wait-for-it.sh` thường chỉ kiểm tra cổng TCP có mở hay không (TCP handshake) mà không biết ứng dụng bên trong đã hoàn tất khởi tạo logic hay chưa. Ngoài ra, nó đòi hỏi phải nhồi thêm script bash/netcat vào image production. Docker Healthcheck kiểm tra ngữ nghĩa sâu bên trong (semantic check), do container engine quản lý trực tiếp và không làm bẩn image.
2. **Vai trò của tham số `start_period` trong `healthcheck` là gì?**
   - *Trả lời*: Cho phép ứng dụng có thời gian "làm nóng" (Warm-up, JIT compilation, database migration). Trong khoảng thời gian này, các kết quả kiểm tra thất bại sẽ không tính vào số lần `retries`, tránh việc container bị đánh dấu `unhealthy` oan trước khi kịp khởi động xong.
3. **Lệnh Docker CLI nào giúp kiểm tra trạng thái Healthcheck hiện tại của container?**
   - *Trả lời*: `docker inspect --format='{{json .State.Health}}' <container-name>` hoặc xem cột `STATUS` trong lệnh `docker ps` (sẽ hiển thị `(healthy)` hoặc `(unhealthy)`).
