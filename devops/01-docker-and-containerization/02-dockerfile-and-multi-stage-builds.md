# 02. Dockerfile & Multi-Stage Builds

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Container Internals & Linux Kernel](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/01-container-internals-and-linux-kernel.md).
- **Module hiện tại**: [Module 01: Docker & Containerization](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [03. Docker Storage & Volumes](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/03-docker-storage-and-volumes.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Cơ Chế Layer Caching trong Docker
- Mỗi chỉ thị trong Dockerfile (`RUN`, `COPY`, `ADD`) tạo ra một **Layer mới chỉ đọc** trong Image.
- **Quy tắc làm vô hiệu hóa Cache (Cache Invalidation)**:
  - Docker so sánh checksum của các file khi thực hiện `COPY`/`ADD`.
  - Đối với các lệnh `RUN`, Docker so sánh chuỗi lệnh text.
  - **Hiệu ứng Domino (Cascade)**: Ngay khi một layer bị thay đổi (Cache Miss), **toàn bộ các layer phía sau nó đều bị ép build lại từ đầu**, bất kể nội dung của chúng có đổi hay không.

### 2.2 Giải Pháp Multi-Stage Builds
Trước khi có Multi-Stage Builds, lập trình viên buộc phải để lại các công cụ biên dịch nặng hàng gigabyte (như .NET SDK, JDK, Go compiler, node-gyp, python build-tools) trong image cuối cùng.
Multi-Stage cho phép:
1. **Stage 1 (Builder)**: Sử dụng base image đầy đủ compiler để build và test.
2. **Stage 2 (Runtime)**: Sử dụng base image tối giản (Alpine hoặc Distroless), chỉ copy binary/artifacts từ Stage 1 sang qua `COPY --from=builder`.
3. **Kết quả**: Image giảm từ $1.5\text{ GB}$ xuống chỉ còn $30\text{ MB} - 100\text{ MB}$, loại bỏ hoàn toàn các lỗ hổng bảo mật từ trình biên dịch.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Để Lộ Secrets / Private Keys Trong Image Layers**
> Thao tác sau hoàn toàn vô nghĩa về mặt bảo mật:
> ```dockerfile
> RUN wget https://secrets.com/private.key && do_something && rm private.key
> ```
> Mặc dù `rm private.key` xóa file ở layer hiện tại, nhưng file đó **vẫn nằm nguyên vẹn ở layer trước** và bất kỳ ai có image đều có thể trích xuất bằng lệnh `docker history` hoặc công cụ `dive`.
> - **Giải pháp**: Dùng BuildKit Secret Mount: `RUN --mount=type=secret,id=mysecret ...`.

> [!WARNING]
> **Bẫy 2: Vi phạm thứ tự Layer Caching làm build chậm chạp**
> Đặt lệnh `COPY . .` trước lệnh `npm install` hoặc `dotnet restore`. Mỗi khi sửa một dòng code nhỏ, Docker buộc phải tải lại toàn bộ dependencies từ Internet!
> - **Quy tắc vàng**: Copy file manifest dependencies (`package.json`, `pom.xml`, `*.csproj`) $\rightarrow$ Cài đặt dependencies $\rightarrow$ Mới copy toàn bộ source code.

> [!IMPORTANT]
> **Bẫy 3: Phân biệt sai `CMD` và `ENTRYPOINT`**
> - Dùng Shell Form (`CMD node server.js`): Khởi chạy qua `/bin/sh -c`, khiến `sh` trở thành PID 1 và nuốt mất tín hiệu `SIGTERM`, không thể Graceful Shutdown!
> - **Luôn dùng Exec Form**: `ENTRYPOINT ["node", "server.js"]` hoặc `CMD ["npm", "start"]`.

---

## 4. Code Mẫu Chuẩn Mực: Dockerfile Multi-Stage Production

```dockerfile
# ==========================================
# STAGE 1: Build & Dependency Resolution
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Tối ưu Cache: Copy file định nghĩa package trước
COPY package*.json tsconfig.json ./

# Cài đặt sạch các dependency cho build
RUN npm ci

# Copy toàn bộ mã nguồn và biên dịch TypeScript sang JS
COPY src/ ./src/
RUN npm run build

# Loại bỏ devDependencies để thu gọn node_modules
RUN npm prune --production

# ==========================================
# STAGE 2: Minimal Production Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Bảo mật: Thiết lập môi trường Production
ENV NODE_ENV=production

# Tạo Non-root user & group chuyên dụng
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Chỉ copy sản phẩm biên dịch và production modules từ builder
COPY --from=builder --chown=appuser:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /usr/src/app/package.json ./package.json

# Chuyển quyền thực thi sang user phi đặc quyền
USER appuser

# Khai báo port cung cấp (chỉ mang tính tài liệu)
EXPOSE 3000

# Exec form đảm bảo node là PID 1 nhận đúng tín hiệu SIGTERM
CMD ["node", "dist/server.js"]
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao nên ưu tiên `COPY` hơn `ADD` trong Dockerfile?**
   - *Trả lời*: `COPY` chỉ đơn thuần sao chép file cục bộ từ context vào container. `ADD` có các tính năng ngầm phức tạp (tự động giải nén file `.tar.gz`, tải file từ URL từ xa) dễ gây bất ngờ và tăng nguy cơ bảo mật. Chỉ dùng `ADD` khi thực sự cần tính năng tự động giải nén tarball.
2. **Distroless Image là gì? Tại sao các ngân hàng và tổ chức tài chính bắt buộc dùng nó?**
   - *Trả lời*: Distroless là image chỉ chứa duy nhất runtime của ứng dụng (vd: Node, Java, .NET) cùng các thư viện C phụ thuộc tối thiểu, loại bỏ hoàn toàn Package Manager (`apt`, `apk`), Shell (`/bin/sh`, `/bin/bash`) và các tiện ích hệ điều hành. Kẻ tấn công dù chiếm được quyền cũng không thể chạy shell hoặc curl thêm mã độc vào máy chủ.
3. **Tác dụng của cờ `--chown=appuser:nodejs` trong lệnh `COPY` là gì?**
   - *Trả lời*: Mặc định, các file được copy vào container đều thuộc quyền sở hữu của `root`. Nếu chạy `USER appuser` sau đó, ứng dụng có thể gặp lỗi `EACCES: permission denied` khi cần đọc/ghi file. Cờ `--chown` đổi chủ sở hữu ngay tại lúc copy mà không cần thêm một layer `RUN chown -R` tốn thêm dung lượng.
