# 01. Docker Compose File Specification v3

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: Docker Storage & Volumes](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/03-docker-storage-and-volumes.md).
- **Module hiện tại**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [02. Service Dependencies & Healthchecks](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/02-service-dependencies-and-healthchecks.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Vai Trò Của Docker Compose
- Khi ứng dụng chuyển từ monolithic sang kiến trúc vi dịch vụ (Microservices), việc chạy hàng chục lệnh `docker run` thủ công với hàng trăm tham số (`-p`, `-v`, `--network`, `-e`) trở nên bất khả thi và dễ sai sót.
- **Docker Compose** là công cụ định nghĩa và chạy các ứng dụng đa container (Multi-container Docker Applications) bằng cách khai báo khai quát qua file YAML (`docker-compose.yml`).
- Docker Compose hoạt động như một bộ điều phối cục bộ (Local Orchestrator), tự động:
  1. Tạo User-defined Bridge Network chung cho các service.
  2. Tạo các Named Volumes được khai báo.
  3. Khởi chạy các container theo đúng thứ tự logic.

### 2.2 Các Khối Cấu Trúc Cốt Lõi Trong File Compose
1. `version`: Phiên bản cấu trúc Compose (vd: `'3.8'` hoặc lược bỏ trong Docker Compose v2 mới nhất).
2. `services`: Danh sách các container cần chạy:
   - `build`: Đường dẫn chứa Dockerfile hoặc cấu hình chi tiết (`context`, `dockerfile`, `args`).
   - `image`: Image có sẵn từ Container Registry (Docker Hub, GHCR).
   - `ports`: Ánh xạ cổng ra máy host (`"HOST:CONTAINER"`).
   - `expose`: Mở cổng nội bộ cho các service khác trong cùng mạng, không public ra host.
   - `volumes`: Gắn kết Named Volumes hoặc Bind Mounts.
   - `environment` & `env_file`: Thiết lập biến môi trường.
   - `restart`: Chính sách khởi động lại (`no`, `always`, `on-failure`, `unless-stopped`).
3. `networks`: Định nghĩa các mạng ảo biệt lập cho stack.
4. `volumes`: Định nghĩa các Named Volumes cấp cao độc lập với vòng đời container.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Bọc Dấu Ngoặc Kép Số Cổng Trong `ports`**
> Khai báo `ports: - 80:80` có thể bị parser YAML hiểu nhầm `80:80` là cơ số 60 (Sexagesimal number, $80 \times 60 + 80 = 4880$), gây lỗi bind port kỳ lạ.
> - **Quy tắc**: Luôn bọc chuỗi cổng trong nháy kép: `ports: - "8080:8080"`.

> [!WARNING]
> **Bẫy 2: Lầm Tưởng Lệnh `docker-compose down` Không Xóa Dữ Liệu**
> Lệnh `docker-compose down` mặc định dừng và xóa container + network, nhưng giữ lại Named Volumes. Tuy nhiên, nếu gõ `docker compose down -v`, toàn bộ **Named Volumes sẽ bị xóa sạch vĩnh viễn**, làm mất toàn bộ dữ liệu cơ sở dữ liệu!

---

## 4. Code Mẫu Chuẩn Mực: Cấu Trúc Compose Khởi Đầu

```yaml
version: '3.8'

services:
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    restart: unless-stopped
    networks:
      - public-net

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    expose:
      - "5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    restart: unless-stopped
    networks:
      - public-net
      - private-net

  database:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: my_super_secret_password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - private-net

networks:
  public-net:
    driver: bridge
  private-net:
    driver: bridge

volumes:
  db_data:
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Lệnh `docker compose up -d --build` thực hiện những bước gì?**
   - *Trả lời*: Cờ `-d` chạy các container ở chế độ nền (Detached mode). Cờ `--build` ép buộc Docker Compose build lại image từ source code (thay vì tái sử dụng image cũ đã build trước đó) trước khi khởi chạy.
2. **Sự khác nhau giữa `docker compose stop` và `docker compose down` là gì?**
   - *Trả lời*: `stop` chỉ đơn thuần gửi tín hiệu `SIGTERM` tạm dừng các container đang chạy mà không xóa bỏ container hay network. `down` dừng các container và xóa hoàn toàn các container, networks, networks bridges do Compose tạo ra.
3. **Tại sao nên dùng `expose` thay vì `ports` cho database service trong môi trường Production?**
   - *Trả lời*: `ports` mở cổng trực tiếp ra ngoài máy Host, khiến Database đối mặt với nguy cơ bị tấn công Brute-force từ Internet. `expose` chỉ cho phép các service trong cùng Docker Network nội bộ kết nối tới Database, giữ cổng hoàn toàn an toàn khỏi thế giới bên ngoài.
