# 03. Multi-tier Networking & Isolation

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: Docker Networking & DNS](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/04-docker-networking-and-dns.md).
- **Module hiện tại**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [04. Environment Variables & Overrides](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/04-environment-variables-and-configuration.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Nguy Cơ Từ Mạng Phẳng (Flat Network Anti-Pattern)
- Theo mặc định, nếu không chỉ định rõ `networks`, Docker Compose sẽ gom toàn bộ các service vào một mạng bridge chung duy nhất (`<project>_default`).
- **Nguy cơ an ninh**:
  - Mọi container đều có thể nhìn thấy và gửi request tới bất kỳ container nào khác.
  - Nếu tầng Frontend (Nginx/Node SSR) bị tấn công chiếm quyền qua lỗ hổng RCE, hacker có thể quét mạng nội bộ và kết nối thẳng tới Database mà không gặp bất kỳ rào cản nào.
- **Giải pháp**: **Phân tầng mạng (Multi-tier Network Segmentation)** theo nguyên lý đặc quyền tối thiểu (Principle of Least Privilege).

```
[ Internet ]
     | (Port 80/443)
+----+------------------------------------------------+
|                   FRONTEND TIER                     |
|  [Reverse Proxy: Nginx]                             |
+----+------------------------------------------------+
     | (frontend-network)
+----+------------------------------------------------+
|                   BACKEND TIER                      |
|  [API Service: Node/Go/Dotnet]                      |
+----+------------------------------------------------+
     | (backend-network)
+----+------------------------------------------------+
|                 PERSISTENCE TIER                    |
|  [PostgreSQL]                [Redis Cache]          |
+-----------------------------------------------------+
```

### 2.2 Cơ Chế Cách Ly
1. `Nginx` chỉ kết nối vào `frontend-network`.
2. `API Service` tham gia cả `frontend-network` và `backend-network`, đóng vai trò cầu nối được kiểm soát.
3. `PostgreSQL` và `Redis` **CHỈ** kết nối vào `backend-network`.
4. **Kết quả**: Về mặt vật lý mạng ảo, `Nginx` hoàn toàn không có route nào để chạm tới `PostgreSQL`.

---

## 3. Code Mẫu Chuẩn Mực: Phân Tầng Mạng Trong Docker Compose

```yaml
version: '3.8'

services:
  # 1. Reverse Proxy: Điểm tiếp nhận traffic duy nhất từ Internet
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
    networks:
      - frontend-net

  # 2. Backend API: Nằm ở giữa 2 mạng
  api:
    build: ./api
    expose:
      - "3000"
    environment:
      - DB_HOST=postgres-db
      - REDIS_HOST=cache-redis
    depends_on:
      postgres-db:
        condition: service_healthy
    networks:
      - frontend-net
      - backend-net

  # 3. Database: Hoàn toàn cô lập khỏi frontend-net
  postgres-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: enterprise_db
      POSTGRES_PASSWORD: SafeSecretPassword!
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - backend-net

  # 4. In-memory Cache: Chỉ backend-net truy cập được
  cache-redis:
    image: redis:7-alpine
    networks:
      - backend-net

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge

volumes:
  pg_data:
```

---

## 4. Kiểm Chứng Cách Ly Mạng Bằng Lệnh

```bash
# Kiểm tra Nginx có ping được Database không (Kỳ vọng: Thất bại hoàn toàn!)
docker compose exec gateway ping -c 2 postgres-db
# Output: ping: bad address 'postgres-db' -> THÀNH CÔNG (Cách ly tuyệt đối)

# Kiểm tra API có ping được Database không (Kỳ vọng: Thành công!)
docker compose exec api ping -c 2 postgres-db
# Output: 2 packets transmitted, 2 packets received, 0% packet loss
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao việc phân tách mạng thành frontend-net và backend-net lại nâng cao bảo mật toàn hệ thống?**
   - *Trả lời*: Tạo ra vùng đệm (Demilitarized Zone - DMZ). Nếu thành phần hướng ra ngoài Internet (Reverse Proxy) bị xâm nhập, kẻ tấn công không thể pivot thẳng vào vùng lưu trữ dữ liệu nhạy cảm (Database/Cache) do Linux kernel bridge hoàn toàn không thiết lập đường định tuyến giữa 2 mạng này.
2. **Network Aliases trong Docker Compose có tác dụng gì?**
   - *Trả lời*: Cho phép gán thêm các tên miền nội bộ thay thế cho service trong một mạng nhất định (`aliases: [db.internal, auth.database]`), giúp các service khác có thể gọi tới bằng các alias đó mà không phụ thuộc vào tên service gốc.
3. **Làm thế nào để hai Docker Compose project khác nhau có thể giao tiếp qua lại với nhau?**
   - *Trả lời*: Khai báo một External Network (`networks: shared-net: external: true`). Cả hai file Compose cùng kết nối vào mạng dùng chung này.
