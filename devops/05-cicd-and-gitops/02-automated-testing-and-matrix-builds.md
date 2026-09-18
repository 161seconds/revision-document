# 02. Matrix Testing & Caching Strategies

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. CI/CD Fundamentals & GitHub Actions](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/01-cicd-fundamentals-and-github-actions.md).
- **Module hiện tại**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [03. Registry & Security Scanning](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/03-container-registry-and-security-scanning.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Chiến Lược Matrix (Ma Trận Kiểm Thử)
- Khi phát triển thư viện, SDK hoặc ứng dụng đa nền tảng, mã nguồn phải được kiểm chứng trên nhiều phiên bản ngôn ngữ và hệ điều hành khác nhau.
- **Matrix Strategy** cho phép tạo ra tích Descartes (Cartesian Product) của các tham số cấu hình:
  - `os: [ubuntu-latest, windows-latest]`
  - `node: [18, 20, 22]`
  - $\rightarrow$ GitHub Actions tự động sinh ra $2 \times 3 = 6$ jobs độc lập chạy song song cùng lúc!
- **Tham số `fail-fast`**:
  - `fail-fast: true` *(Mặc định)*: Nếu 1 trong 6 jobs bị lỗi, hệ thống lập tức hủy 5 jobs còn lại để tiết kiệm thời gian và tài nguyên runner.
  - `fail-fast: false`: Tiếp tục chạy toàn bộ ma trận để lập trình viên thấy được bức tranh toàn cảnh về những môi trường nào pass, môi trường nào fail.

### 2.2 Tối Ưu Tốc Độ CI Bằng Caching
- Việc tải lại hàng trăm megabytes thư mục `node_modules`, `~/.m2` (Java), hoặc `~/.nuget/packages` (.NET) sau mỗi commit là nguyên nhân số 1 khiến pipeline CI chạy chậm từ 5 đến 15 phút.
- **Cơ chế Cache (`actions/cache`)**:
  1. Tính toán giá trị băm (Hash Key) của file lockfile:
     $$\text{Key} = \text{"npm-deps-" } + \text{hashFiles('**/package-lock.json')}$$
  2. Trước khi cài đặt, runner kiểm tra xem Key này đã có trên GitHub Cache Store chưa.
  3. **Cache Hit**: Khôi phục nguyên vẹn thư mục dependencies từ cache chỉ mất 3-5 giây!
  4. Lệnh `npm ci` / `dotnet restore` nhận thấy mọi package đã có sẵn trên đĩa và bỏ qua việc tải từ Internet.

---

## 3. Code Mẫu Chuẩn Mực: Workflow Matrix & Tự Động Lưu Artifacts

```yaml
name: Cross-Platform Matrix Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-matrix:
    name: Test on ${{ matrix.os }} - Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [18, 20, 22]
        # Ngoại lệ: Bỏ qua test Node 18 trên Windows
        exclude:
          - os: windows-latest
            node-version: 18

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Clean Install Dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test -- --ci --reporters=default --reporters=jest-junit

      # Lưu trữ báo cáo kết quả kiểm thử (Test Reports)
      - name: Upload Test Report Artifact
        if: always() # Luôn lưu dù test pass hay fail
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.os }}-node${{ matrix.node-version }}
          path: junit.xml
          retention-days: 7
```

---

## 4. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao nên cấu hình `if: always()` cho bước upload test report artifact?**
   - *Trả lời*: Mặc định, nếu bước chạy test (`npm test`) thất bại (Exit code khác 0), GitHub Actions sẽ bỏ qua toàn bộ các bước tiếp theo trong job. Khai báo `if: always()` đảm bảo bước upload báo cáo test vẫn được thực thi ngay cả khi có ca test bị fail, giúp đội ngũ kỹ sư có file kết quả để phân tích nguyên nhân lỗi.
2. **`restore-keys` trong `actions/cache` hoạt động như thế nào khi Cache Miss?**
   - *Trả lời*: Khi không tìm thấy cache khớp 100% với Primary Key (do có 1 thư viện mới được thêm vào lockfile), `restore-keys` cung cấp tiền tố dự phòng (Prefix). Runner sẽ lấy bản cache gần nhất có tiền tố tương ứng. Trình quản lý gói chỉ cần tải thêm thư viện mới thay vì phải tải lại 100% từ đầu.
3. **Khi nào nên sử dụng cờ `matrix.include`?**
   - *Trả lời*: Khi bạn muốn thêm một trường hợp thử nghiệm đặc biệt vào ma trận mà không muốn nhân đôi số lượng jobs (vd: Thêm cờ `experimental: true` chỉ dành riêng cho bản Node.js 23 mới nhất).
