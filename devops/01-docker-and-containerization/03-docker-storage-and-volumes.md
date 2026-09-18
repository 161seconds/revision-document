# 03. Docker Storage & Volumes

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. Dockerfile & Multi-Stage Builds](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/02-dockerfile-and-multi-stage-builds.md).
- **Module hiện tại**: [Module 01: Docker & Containerization](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [04. Docker Networking & DNS](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/04-docker-networking-and-dns.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tính Tạm Thời (Ephemeral) Của Container Layer
- Mọi file được tạo mới hoặc chỉnh sửa trong container mặc định được ghi lên **Lớp Ghi Tạm Thời (Writable Layer)** thông qua OverlayFS.
- Khi container bị xóa (`docker rm`), lớp ghi này **bị hủy diệt hoàn toàn**, kéo theo toàn bộ dữ liệu (như bảng Database, logs) biến mất.
- Để lưu trữ bền vững (Data Persistence), Docker cung cấp 3 cơ chế Storage Mounts.

### 2.2 So Sánh Chi Tiết Ba Loại Mounts
| Đặc tính | Named Volume | Bind Mount | tmpfs Mount |
| :--- | :--- | :--- | :--- |
| **Vị trí lưu trữ** | Do Docker quản lý tại `/var/lib/docker/volumes/` | Bất kỳ thư mục nào trên máy Host do người dùng chỉ định | Chỉ lưu trên **RAM** của máy Host, không ghi xuống đĩa |
| **Quản lý bằng Docker CLI**| Có (`docker volume create/ls/rm/inspect`) | Không (quản lý bằng filesystem của OS) | Không |
| **Tính độc lập** | Hoàn toàn độc lập với hệ điều hành và đường dẫn Host | Phụ thuộc chặt chẽ vào cấu trúc thư mục của Host | Mất sạch dữ liệu khi container dừng |
| **Hiệu năng I/O** | Tối ưu cao, an toàn khi chạy nhiều container | Có thể chậm trên Docker Desktop (macOS/Windows do ảo hóa) | **Cực nhanh (Tốc độ RAM)** |
| **Trường hợp sử dụng** | **Cơ sở dữ liệu Production (Postgres, MySQL, Mongo)** | **Môi trường Dev (Live Reload code)** | **Secrets, Token tạm thời, RAM cache** |

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Xung Đột Quyền Truy Cập Khi Dùng Bind Mount (UID/GID Mismatch)**
> Khi bind mount thư mục từ máy Host vào container chạy user không đặc quyền (vd: UID `1001`), nếu thư mục trên host thuộc quyền `root` (UID `0`) hoặc user cá nhân của host (UID `1000`), container sẽ lập tức bị lỗi `Permission Denied`.
> - **Giải pháp**: Phải thiết lập quyền thư mục host hoặc dùng cờ `--user "$(id -u):$(id -g)"` khi chạy.

> [!WARNING]
> **Bẫy 2: Xóa Nhầm Dữ Liệu Khi Dùng `docker rm -v`**
> Cờ `-v` khi xóa container sẽ tự động xóa luôn các Anonymous Volumes được gắn kèm container. Với cơ sở dữ liệu quan trọng, **bắt buộc phải đặt tên (Named Volume)** rõ ràng để tránh bị xóa nhầm.

> [!IMPORTANT]
> **Bẫy 3: Đè Mất File Bên Trong Image Bằng Bind Mount Rỗng**
> Nếu bạn bind mount một thư mục trống từ Host vào một thư mục đã có file sẵn trong Image (vd: `-v $(pwd)/dist:/app/dist`), Docker sẽ làm thư mục trong container trở nên trống trơn, gây lỗi `Cannot find module`.

---

## 4. Lệnh Thao Tác & Backup/Restore Volume Thực Tế

```bash
# 1. Tạo và quản lý Named Volume
docker volume create pg_data_production
docker volume inspect pg_data_production

# 2. Khởi chạy Database gắn với Named Volume
docker run -d \
  --name db-postgres \
  -e POSTGRES_PASSWORD=SuperSecretPass! \
  -v pg_data_production:/var/lib/postgresql/data \
  postgres:16-alpine

# 3. Kỹ thuật Backup Volume chuẩn: Khởi chạy container tạm thời để nén dữ liệu
docker run --rm \
  -v pg_data_production:/source:ro \
  -v $(pwd)/backups:/backup \
  alpine tar -czvf /backup/pg_data_$(date +%Y%m%d).tar.gz -C /source .

# 4. Kỹ thuật Restore Volume từ file tar.gz
docker run --rm \
  -v pg_data_production:/target \
  -v $(pwd)/backups:/backup \
  alpine tar -xzvf /backup/pg_data_20260919.tar.gz -C /target
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao Named Volume được khuyến nghị cho Database trên Production thay vì Bind Mount?**
   - *Trả lời*: Named Volume được Docker quản lý độc lập tại một vị trí chuẩn mực, không phụ thuộc vào đường dẫn tuyệt đối của máy host, tránh xung đột quyền ghi của filesystem host, và đảm bảo tính di động (Portability) giữa các server khác nhau.
2. **tmpfs mount khác gì so với volume thông thường?**
   - *Trả lời*: `tmpfs` chỉ ghi dữ liệu vào bộ nhớ RAM của host mà không bao giờ ghi xuống ổ đĩa. Khi container dừng, dữ liệu biến mất hoàn toàn. Điều này cực kỳ lý tưởng để lưu trữ các API Keys, TLS certs giải mã tạm thời hoặc bộ đệm tốc độ cao nhằm tránh ghi dấu vết lên disk.
3. **Lệnh nào dọn dẹp các volume không còn container nào sử dụng?**
   - *Trả lời*: `docker volume prune` (hoặc cờ `-f` để chạy không cần xác nhận).
