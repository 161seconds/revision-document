# 04. Environment Variables & Overrides

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Compose File Specification v3](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/01-compose-file-specification-v3.md).
- **Module hiện tại**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Thứ Tự Ưu Tiên Nạp Biến Môi Trường
Khi cùng một biến được khai báo ở nhiều nơi, Docker giải quyết xung đột theo thứ tự ưu tiên từ cao xuống thấp:

```
[ 1. Biến được set trực tiếp trong Shell (export PORT=9000) ]  (ƯU TIÊN CAO NHẤT)
                         ↓
[ 2. Khối 'environment' trong file docker-compose.yml ]
                         ↓
[ 3. File được chỉ định trong khối 'env_file' ]
                         ↓
[ 4. Tệp .env tại thư mục gốc của project (nội suy compose file) ]
                         ↓
[ 5. Chỉ thị 'ENV' mặc định trong Dockerfile ]                (ƯU TIÊN THẤP NHẤT)
```

### 2.2 Cú Pháp Nội Suy Biến (Variable Interpolation)
Docker Compose hỗ trợ cú pháp biến theo chuẩn POSIX Shell:
- `${VARIABLE}`: Lấy giá trị biến. Nếu không có biến, coi như chuỗi rỗng.
- `${VARIABLE:-default_value}`: **Nếu biến chưa được set hoặc rỗng**, sử dụng `default_value`.
- `${VARIABLE-default_value}`: Chỉ sử dụng `default_value` nếu biến **hoàn toàn chưa được khai báo**.
- `${VARIABLE:?Error message}`: **Báo lỗi nghiêm trọng và dừng build/chạy ngay lập tức** nếu biến chưa được gán. Rất thích hợp cho mật khẩu Database bắt buộc.

---

## 3. Quản Lý Đa Môi Trường (Dev / Prod Override)

### 3.1 Cơ Chế Tự Động Hợp Nhất (Compose Merging)
Khi bạn chạy lệnh `docker compose up`, Docker mặc định tự động tìm và hợp nhất 2 file:
1. `docker-compose.yml` (Cấu hình chung, cơ bản).
2. `docker-compose.override.yml` (Cấu hình ghi đè dành riêng cho môi trường Local Dev: mount code live-reload, expose cổng debug).

### 3.2 Tách Biệt Production
Trong môi trường Production, không dùng file override tự động. Thay vào đó, chỉ định rõ ràng qua cờ `-f`:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 4. Code Mẫu Chuẩn Mực: Cấu Hình Biến An Toàn

### Tệp `.env.example` (Commit lên Git để làm tài liệu mẫu):
```ini
# App General
APP_ENV=production
APP_PORT=8080

# Database Credentials
DB_NAME=production_db
DB_USER=app_user
DB_PASSWORD=ChangeMeInProduction!
```

### Tệp `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    image: myapp:${TAG:-latest}
    ports:
      - "${APP_PORT:-8080}:8080"
    environment:
      - NODE_ENV=${APP_ENV:-production}
      - DATABASE_URL=postgres://${DB_USER:-postgres}:${DB_PASSWORD:?DB_PASSWORD is required!}@db:5432/${DB_NAME:-appdb}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-appdb}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD is required!}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 5s
      timeout: 3s
      retries: 5
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao tệp `.env` không bao giờ được phép commit lên GitHub/GitLab?**
   - *Trả lời*: File `.env` thường chứa các thông tin nhạy cảm (Production Database Passwords, JWT Secret Keys, Stripe API Keys). Đẩy lên Git repo sẽ bị lộ lọt dữ liệu hoặc bot quét tự động tấn công. Chỉ commit file `.env.example` với các giá trị mẫu không nhạy cảm.
2. **Lệnh nào giúp kiểm tra toàn bộ cấu hình Compose sau khi đã nạp biến và hợp nhất các file override?**
   - *Trả lời*: `docker compose config`. Lệnh này sẽ in ra toàn bộ cây YAML hoàn chỉnh đã được phân giải biến để kiểm tra trước khi thực sự chạy.
3. **Cú pháp `${DB_PASSWORD:?Password is required}` giải quyết bài toán gì trong Production?**
   - *Trả lời*: Ngăn ngừa việc hệ thống chạy với mật khẩu mặc định rỗng hoặc undefined. Nếu người vận hành quên truyền `DB_PASSWORD` vào môi trường, Docker Compose sẽ từ chối khởi động và in thông báo lỗi ngay lập tức, tránh tạo ra container có lỗ hổng bảo mật.
