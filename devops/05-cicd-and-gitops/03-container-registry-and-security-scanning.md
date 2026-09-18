# 03. Container Registry & Security Scanning

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: Dockerfile & Multi-Stage](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/02-dockerfile-and-multi-stage-builds.md).
- **Module hiện tại**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [04. GitOps & Continuous Deployment](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/04-gitops-and-continuous-deployment.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Đăng Tải Image Lên GitHub Container Registry (GHCR)
- **GHCR (`ghcr.io`)** là kho lưu trữ container tích hợp trực tiếp trong hệ sinh thái GitHub.
- **Ưu điểm vượt trội**:
  - Không cần tạo tài khoản Docker Hub riêng.
  - Không cần lưu trữ mật khẩu tĩnh dài hạn: Xác thực tự động thông qua biến môi trường có sẵn `${{ secrets.GITHUB_TOKEN }}`.
  - Hỗ trợ phân quyền chặt chẽ gắn liền với quyền hạn của Repository / Organization.

### 2.2 Tự Động Quét Lỗ Hổng Bảo Mật (DevSecOps với Trivy)
- **Shift-Left Security**: Phát hiện và chặn đứng các lỗ hổng bảo mật (CVEs) ngay tại bước CI, trước khi Image kịp đẩy lên Production.
- **Trivy (Aqua Security)**: Công cụ quét lỗ hổng mã nguồn mở hàng đầu:
  1. Quét các gói phần mềm của hệ điều hành OS (Alpine, Debian, Ubuntu packages).
  2. Quét các thư viện phụ thuộc của ứng dụng (npm, NuGet, Maven, pip).
  3. Nếu phát hiện lỗ hổng mức độ **`CRITICAL`** hoặc **`HIGH`**, Trivy trả về Exit Code `1` $\rightarrow$ **Pipeline lập tức dừng lại và từ chối deploy!**

### 2.3 Chiến Lược Gắn Tag Bất Biến (Immutable Tagging)
- **Tuyệt đối không bao giờ dùng `:latest` trên môi trường Production**:
  - `:latest` là tag có thể bị ghi đè (Mutable). Bạn sẽ không thể biết chính xác bản deploy hôm nay chứa commit nào, và việc rollback trở nên bất khả thi.
- **Quy chuẩn gắn tag chuẩn mực**:
  - Gắn tag theo Git Commit SHA ngắn: `ghcr.io/org/app:sha-a421fbe` (Mỗi commit tạo 1 image bất biến).
  - Gắn tag theo Semantic Versioning khi phát hành: `ghcr.io/org/app:v2.1.0`.

---

## 3. Code Mẫu Chuẩn Mực: Pipeline Build, Scan & Push Lên GHCR

```yaml
name: Build, Scan & Publish Container Image

on:
  push:
    branches: [ main ]
    tags: [ 'v*.*.*' ]

permissions:
  contents: read
  packages: write
  security-events: write

jobs:
  build-and-scan:
    name: Build & Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      # 1. Cài đặt Docker Buildx để kích hoạt BuildKit
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 2. Đăng nhập vào GitHub Container Registry
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # 3. Trích xuất metadata (Tags & Labels) theo Git ref
      - name: Extract Docker Metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=sha-,format=short
            type=semver,pattern={{version}}
            type=raw,value=latest,enable={{is_default_branch}}

      # 4. Build image cục bộ để phục vụ quét bảo mật
      - name: Build Local Image for Security Scan
        uses: docker/build-push-action@v5
        with:
          context: .
          load: true # Nạp image vào docker daemon cục bộ thay vì push
          tags: ${{ github.repository }}:scan-target
          cache-from: type=gha

      # 5. Quét lỗ hổng với Trivy - Chặn đứng nếu có CVE Critical
      - name: Run Trivy Vulnerability Scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ github.repository }}:scan-target
          format: 'table'
          exit-code: '1' # Ném lỗi dừng pipeline nếu phát hiện vi phạm
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'

      # 6. Đẩy image chính thức lên GHCR sau khi đã vượt qua vòng kiểm duyệt
      - name: Push Verified Image to GHCR
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 4. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao việc đăng nhập vào cloud (AWS/GCP) bằng OpenID Connect (OIDC) lại an toàn hơn lưu Secret Access Key tĩnh trong GitHub?**
   - *Trả lời*: Access Key tĩnh có nguy cơ bị lộ lọt và không bao giờ hết hạn nếu quên đổi khóa (Rotate). OIDC sử dụng cơ chế trao đổi mã thông báo danh tính (Identity Token) có thời hạn siêu ngắn (vài phút), không cần lưu trữ bất kỳ secret nào trong GitHub, và chỉ cấp quyền tạm thời cho đúng repository và nhánh git được chỉ định.
2. **Cờ `load: true` trong `docker/build-push-action` có tác dụng gì?**
   - *Trả lời*: Docker Buildx mặc định lưu image trong bộ nhớ đệm nội bộ của BuildKit. Muốn các công cụ quét bảo mật chạy trên runner (như Trivy hoặc Docker CLI) có thể nhìn thấy và quét image đó, ta cần cờ `load: true` để nạp image vào Docker daemon cục bộ của máy ảo runner.
3. **Ý nghĩa của `ignore-unfixed: true` trong cấu hình quét lỗ hổng Trivy là gì?**
   - *Trả lời*: Bỏ qua các lỗ hổng mà tác giả thư viện/hệ điều hành hiện tại chưa phát hành bản vá (fix). Nếu không bật cờ này, pipeline sẽ bị chặn đứng bởi những lỗi mà lập trình viên hoàn toàn không có cách nào sửa chữa được vào thời điểm hiện tại.
