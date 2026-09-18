# 04. Docker Networking & DNS

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Container Internals & Linux Kernel](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/01-container-internals-and-linux-kernel.md).
- **Module hiện tại**: [Module 01: Docker & Containerization](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bốn Chế Độ Mạng (Network Drivers) Trong Docker
1. **Bridge (Mặc định)**:
   - Tạo ra một Linux bridge ảo (`docker0` hoặc user-defined bridge).
   - Mỗi container được cấp phát một Virtual Ethernet pair (`veth` pair): một đầu cắm vào bridge của host, một đầu cắm vào `eth0` của container trong Network Namespace của nó.
   - Traffic ra ngoài Internet được chuyển tiếp thông qua iptables **NAT (Network Address Translation)** (IP Masquerade).
2. **Host (`--network host`)**:
   - Container không được cấp phát network namespace riêng mà dùng trực tiếp network stack của Host.
   - Tốc độ mạng đạt cực đại (Zero NAT overhead), nhưng không thể chạy 2 container cùng bind vào một port (gây xung đột port).
3. **Overlay**:
   - Dành cho hệ thống đa máy chủ (Multi-host clustering trong Docker Swarm hoặc Kubernetes).
   - Đóng gói gói tin qua giao thức VXLAN qua cổng UDP 4789.
4. **None (`--network none`)**:
   - Container chỉ có duy nhất interface Loopback (`127.0.0.1`), bị cô lập hoàn toàn khỏi mạng nội bộ và Internet (Thích hợp cho các batch job mã hóa, hash mật khẩu hoặc xử lý dữ liệu tuyệt mật).

### 2.2 Default Bridge vs User-Defined Custom Bridge (DNS Resolution)
Đây là kiến thức phỏng vấn cực kỳ phổ biến:
- **Default Bridge (`bridge`)**: **KHÔNG hỗ trợ phân giải tên miền tự động (Automatic DNS Resolution)**. Nếu bạn chạy 2 container trên default bridge, lệnh `ping container_b` sẽ báo lỗi `Name or service not known` trừ khi truyền cờ `--link` cũ kỹ.
- **User-Defined Bridge (`docker network create mynet`)**: **Tự động kích hoạt Embedded DNS Server của Docker (`127.0.0.11`)**. Các container cùng mạng có thể gọi nhau trực tiếp thông qua Tên Container hoặc Tên Service (`curl http://my-api:8080`).

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Nhầm Lẫn Giữa `EXPOSE` và `-p` (Port Publishing)**
> - `EXPOSE 8080` trong Dockerfile **KHÔNG HỀ** mở cổng ra ngoài máy Host. Nó chỉ là một dòng tài liệu (documentation metadata) cho con người và các công cụ khác biết container dự định dùng port nào.
> - Muốn máy ngoài truy cập được, bắt buộc phải dùng cờ publish: `-p <HostPort>:<ContainerPort>` (vd: `-p 8080:8080`).

> [!WARNING]
> **Bẫy 2: Lỗi Kết Nối `localhost` Giữa Hai Container**
> Nhiều lập trình viên cấu hình ứng dụng Web kết nối tới Database bằng `DB_HOST=localhost`.
> - Trong Docker, `localhost` bên trong container trỏ tới chính loopback của container đó, **không phải máy Host cũng không phải container Database**.
> - **Giải pháp**: Đặt cả 2 container vào chung một User-defined Network và dùng Container Name làm hostname: `DB_HOST=db-postgres`.

> [!IMPORTANT]
> **Bẫy 3: Docker Tự Ý Sửa iptables Bỏ Qua UFW Firewall Trên Linux**
> Khi bạn dùng `-p 8080:8080`, Docker daemon tự động chèn rule vào bảng `PREROUTING` của `iptables`. Rule này được xử lý **TRƯỚC** các rule tường lửa UFW (Uncomplicated Firewall). Do đó, dù bạn dùng UFW chặn port 8080, người ngoài Internet vẫn có thể truy cập được!
> - **Giải pháp**: Bind rõ ràng vào loopback `-p 127.0.0.1:8080:8080` nếu chỉ muốn truy cập nội bộ qua Nginx Reverse Proxy.

---

## 4. Kịch Bản Thiết Lập Mạng Cách Ly Đa Tầng

```bash
# 1. Tạo 2 mạng ảo biệt lập: frontend-net và backend-net
docker network create --driver bridge frontend-net
docker network create --driver bridge backend-net

# 2. Database chỉ thuộc backend-net (Hoàn toàn ẩn khỏi frontend)
docker run -d --name database --network backend-net \
  -e POSTGRES_PASSWORD=pass postgres:16-alpine

# 3. Backend API kết nối cả 2 mạng (làm cầu nối)
docker run -d --name api-service --network backend-net \
  node:20-alpine sleep 3600
docker network connect frontend-net api-service

# 4. Web Frontend chỉ thuộc frontend-net (Không thể tiếp cận trực tiếp database)
docker run -d --name web-ui --network frontend-net \
  nginx:alpine

# 5. Kiểm chứng phân giải DNS nội bộ
docker exec -it api-service ping -c 2 database   # Thành công!
docker exec -it web-ui ping -c 2 database        # Thất bại: Hoàn toàn cách ly bảo mật!
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao hai container cùng kết nối vào Default Bridge lại không thể gọi nhau qua tên container?**
   - *Trả lời*: Docker giữ nguyên Default Bridge để duy trì tính tương thích ngược cho các hệ thống cũ. Embedded DNS Server (`127.0.0.11`) của Docker chỉ được tự động kích hoạt trên các User-defined Custom Bridge Networks.
2. **Cơ chế NAT trong Docker Bridge hoạt động như thế nào khi container gửi request ra Internet?**
   - *Trả lời*: Khi gói tin đi từ interface `veth` của container qua bridge `docker0` để ra card mạng vật lý của host (`eth0`), kernel iptables áp dụng luật `MASQUERADE` (Source NAT). Địa chỉ IP nguồn của container (vd: `172.17.0.2`) được hoán đổi thành địa chỉ IP thật của máy Host.
3. **Làm thế nào để container giao tiếp với một service đang chạy trực tiếp trên máy Host (ngoài container)?**
   - *Trả lời*: Trên Docker Desktop (Mac/Windows), dùng hostname đặc biệt `host.docker.internal`. Trên Linux, thêm cờ `--add-host=host.docker.internal:host-gateway`.
