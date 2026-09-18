# 01. Container Internals & Linux Kernel

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Linux Architecture & Process Model](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md).
- **Module hiện tại**: [Module 01: Docker & Containerization](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [02. Dockerfile & Multi-Stage Builds](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/02-dockerfile-and-multi-stage-builds.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Container vs Virtual Machine (VM)
| Tiêu chí | Virtual Machine (VM) | Container (Docker / containerd) |
| :--- | :--- | :--- |
| **Kiến trúc** | Phần cứng ảo hóa qua **Hypervisor** (Type 1 hoặc Type 2) | Tiến trình phân lập trực tiếp trên **Host Linux Kernel** |
| **Hệ điều hành** | Mỗi VM chạy một **Guest OS riêng** (kernel, services, drivers) | Dùng chung **Host OS Kernel** duy nhất |
| **Thời gian khởi động**| Vài chục giây đến vài phút | **Vài trăm mili-giây** (như khởi động một process) |
| **Tốn kém tài nguyên** | Cố định RAM/Disk cho Guest OS (hàng chục GB) | Chỉ tiêu tốn đúng lượng RAM/CPU tiến trình thực sự cần |
| **Mức độ cô lập** | Rất cao (Hardware-level isolation) | Cao (Kernel-level process isolation) |

### 2.2 Ba Trụ Cột Nền Tảng Của Linux Container
1. **Linux Namespaces (Tạo không gian ảo riêng biệt)**:
   - `pid`: Process ID (Tiến trình chính trong container luôn thấy mình là PID 1, dù trên host nó là PID 84210).
   - `net`: Network stack riêng (loopback, virtual ethernet `veth`, routing table, IP riêng).
   - `mnt`: File system mount points riêng (root filesystem `/` riêng biệt).
   - `ipc`: Inter-Process Communication (POSIX Message Queues, SysV IPC).
   - `uts`: Hostname và domain name riêng.
   - `user`: User và Group ID mapping (UID 0 root trong container có thể được ánh xạ thành UID 10001 không có quyền hạn trên host).
2. **cgroups (Control Groups - Giới hạn và thống kê tài nguyên)**:
   - cgroups v1 & cgroups v2 (từ Linux kernel 4.5+).
   - Thiết lập ngưỡng: `cpu.max`, `memory.max`, `memory.high`.
   - Khi container vượt quá `memory.max`, Linux Kernel kích hoạt **OOM Killer (Out Of Memory Killer)** để gửi tín hiệu `SIGKILL` (Exit code 137) tới PID 1 của container.
3. **OverlayFS (Union File System)**:
   - Gồm 4 thư mục:
     - `lowerdir`: Các image layers chỉ đọc (read-only).
     - `upperdir`: Lớp ghi tạm thời của container (read-write).
     - `workdir`: Thư mục đệm nội bộ của kernel để thực hiện copy-up.
     - `merged`: Điểm mount hợp nhất mà container nhìn thấy.
   - **Cơ chế Copy-on-Write (CoW)**: Khi container sửa một file từ image, file đó được sao chép từ `lowerdir` lên `upperdir` trước khi ghi, bảo toàn image gốc không bị thay đổi.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Tiến Trình Zombie & PID 1 Problem**
> Trong Linux, PID 1 có trách nhiệm đặc biệt: dọn dẹp các tiến trình con mồ côi (Zombie processes) và chuyển tiếp tín hiệu (`SIGTERM`, `SIGINT`). Nếu ứng dụng của bạn (vd: script Node.js hoặc Bash) chạy dưới PID 1 mà không xử lý tín hiệu thoát, container sẽ bị đơ 10 giây khi `docker stop` trước khi bị kill thô bạo bằng `SIGKILL`.
> - **Giải pháp**: Dùng init system siêu nhẹ như `tini` hoặc cờ `docker run --init`.

> [!WARNING]
> **Bẫy 2: Lầm Tưởng Container Là Hộp Cách Ly Tuyệt Đối (Container Escape)**
> Container chia sẻ chung Kernel. Nếu container chạy với cờ `--privileged` hoặc chạy dưới quyền `root` (UID 0), kẻ tấn công khai thác được một lỗ hổng trong Kernel có thể thoát ra và chiếm toàn quyền kiểm soát máy Host (Host Takeover). Luôn chạy container dưới **Non-root User**.

---

## 4. Kiểm Chứng Trực Tiếp Trên Linux

```bash
# 1. Xem các namespace của một tiến trình trên Linux
ls -l /proc/<PID>/ns/

# 2. Xem cấu hình cgroups giới hạn bộ nhớ của container
cat /sys/fs/cgroup/memory/docker/<container-id>/memory.limit_in_bytes # cgroups v1
cat /sys/fs/cgroup/docker/<container-id>/memory.max                  # cgroups v2

# 3. Chạy container với giới hạn bộ nhớ và CPU chặt chẽ
docker run -d \
  --name limited-app \
  --memory="512m" \
  --cpus="1.5" \
  --pids-limit=100 \
  alpine sleep 3600
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Sự khác biệt cốt lõi giữa Namespaces và cgroups là gì?**
   - *Trả lời*: Namespaces quyết định **tiến trình có thể NHÌN THẤY những gì** (phân lập không gian PID, IP, Filesystem). cgroups quyết định **tiến trình có thể SỬ DỤNG bao nhiêu tài nguyên** (giới hạn CPU, RAM, I/O).
2. **Tại sao container lại có thời gian khởi động chỉ tính bằng mili-giây so với VM?**
   - *Trả lời*: Container không cần nạp BIOS, không cần boot Linux Kernel và không cần nạp các service hệ thống của Guest OS. Nó chỉ đơn thuần là `fork()` một tiến trình mới trên Host Kernel đã chạy sẵn, áp dụng namespaces và cgroups.
3. **Hiện tượng OOMKilled trong container biểu hiện bằng Exit Code nào?**
   - *Trả lời*: Exit Code `137` ($128 + 9$ do nhận tín hiệu `SIGKILL`).
