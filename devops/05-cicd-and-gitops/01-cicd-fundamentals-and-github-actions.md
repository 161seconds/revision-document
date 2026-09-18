# 01. CI/CD Fundamentals & GitHub Actions

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: Dockerfile & Multi-Stage](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/02-dockerfile-and-multi-stage-builds.md), [Git Basics](file:///d:/my-project/revision-document/git/README.md).
- **Module hiện tại**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [02. Matrix Testing & Caching](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/02-automated-testing-and-matrix-builds.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Vòng Đời Tự Động Hóa: CI vs CD
- **Continuous Integration (CI - Tích Hợp Liên Tục)**:
  - Mỗi khi lập trình viên tạo Pull Request hoặc Push commit:
  - Hệ thống tự động: Checkout mã nguồn $\rightarrow$ Kiểm tra chuẩn code (Linting & Formatting) $\rightarrow$ Chạy Unit/Integration Tests $\rightarrow$ Quét bảo mật (SAST) $\rightarrow$ Build Image.
  - Mục tiêu: Phát hiện lỗi sớm trong vòng 5-10 phút, ngăn chặn code lỗi được merge vào nhánh chính (`main`).
- **Continuous Delivery / Deployment (CD - Phân Phối / Triển Khai Liên Tục)**:
  - **Delivery**: Mã nguồn sau khi build và test thành công được đóng gói và nộp sẵn vào kho lưu trữ (Docker Registry, Artifact Repository), chờ phê duyệt (Manual Approval) để deploy lên Production.
  - **Deployment**: Hoàn toàn không cần con người can thiệp. Mọi commit vượt qua kiểm thử trên nhánh `main` được tự động cập nhật trực tiếp lên môi trường Production.

### 2.2 Giải Phẫu Một GitHub Actions Workflow
File workflow được đặt tại thư mục `.github/workflows/*.yaml` với cấu trúc phân cấp:

```
[ Workflow: Quy trình tổng thể kích hoạt bởi Event (on: push / pull_request) ]
                             ↓
[ Jobs: Các công việc chạy song song trên các Runner (máy ảo) độc lập ]
                             ↓
[ Steps: Các bước thực thi tuần tự bên trong 1 Job ]
                             ↓
[ Actions / Run: Sử dụng Action cộng đồng (uses) hoặc chạy lệnh shell (run) ]
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quản Lý Phân Quyền GitHub Token Quá Rộng Rãi (Privilege Escalation)**
> Mặc định trong các repo cũ, `${{ secrets.GITHUB_TOKEN }}` được cấp quyền đọc/ghi (`write`) toàn bộ repo. Kẻ tấn công gửi mã độc qua PR từ fork có thể dùng token này để sửa đổi mã nguồn hoặc chiếm quyền repo!
> - **Quy tắc bảo mật**: Luôn khai báo khối `permissions` ở cấp độ tối thiểu (Least Privilege):
> ```yaml
> permissions:
>   contents: read
>   packages: write
> ```

> [!WARNING]
> **Bẫy 2: Hardcode Mật Khẩu / API Keys Vào File Workflow YAML**
> Mọi file trong repo đều được lưu trữ vĩnh viễn trong Git history.
> - **Giải pháp**: Luôn lưu thông tin nhạy cảm trong **GitHub Repository Secrets** hoặc **Environment Secrets** và truy cập qua cú pháp `${{ secrets.MY_SECRET }}`.

---

## 4. Code Mẫu Chuẩn Mực: Workflow Kiểm Thử Tự Động

```yaml
name: Continuous Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Hủy bỏ các lượt chạy cũ nếu có commit mới được push đè lên cùng PR
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint-and-test:
    name: Lint & Unit Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Execute Automated Test Suite
        run: npm test -- --coverage
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Runner trong GitHub Actions là gì? Sự khác nhau giữa GitHub-hosted runner và Self-hosted runner?**
   - *Trả lời*: Runner là máy chủ thực thi các jobs trong workflow. **GitHub-hosted runner** là máy ảo tạm thời (Ephemeral VM) do GitHub cấp phát (Ubuntu, Windows, macOS), được dọn dẹp sạch sẽ sau mỗi lần chạy, bảo mật cao. **Self-hosted runner** là máy chủ vật lý hoặc VM do công ty tự quản lý trong Data Center / Cloud riêng, giúp tiết kiệm chi phí, tận dụng phần cứng mạnh hoặc truy cập được mạng nội bộ VPN của doanh nghiệp.
2. **Cấu hình `cancel-in-progress: true` trong khối `concurrency` mang lại lợi ích gì?**
   - *Trả lời*: Khi một lập trình viên liên tục push 3 commit mới lên cùng một Pull Request, hệ thống sẽ tự động hủy (cancel) lượt chạy CI của 2 commit cũ đang dở dang và chỉ tập trung tài nguyên runner chạy commit mới nhất. Điều này giúp giảm 70% thời gian chờ đợi hàng đợi và tiết kiệm chi phí phút chạy runner.
3. **Tại sao nên dùng `npm ci` thay vì `npm install` trong kịch bản CI?**
   - *Trả lời*: `npm ci` (Clean Install) yêu cầu bắt buộc phải có file `package-lock.json` và cài đặt chính xác các phiên bản được ghi nhận trong lockfile mà không tự ý cập nhật lên phiên bản mới hơn. Nếu phát hiện sai lệch checksum giữa `package.json` và lockfile, `npm ci` sẽ báo lỗi ngay lập tức, đảm bảo tính nhất quán tuyệt đối giữa các môi trường.
