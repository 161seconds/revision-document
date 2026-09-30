# 03. Production Security Headers & Modern Content Security Policy (CSP)

Các tiêu đề HTTP Security (HTTP Security Headers) là phòng tuyến phòng thủ cuối cùng (Last Line of Defense) của trình duyệt web. Nếu ứng dụng của bạn vô tình chứa một lỗ hổng XSS hoặc Clickjacking, một bộ tiêu đề an ninh được cấu hình chuẩn mực có thể vô hiệu hóa hoàn toàn khả năng khai thác của kẻ tấn công.

---

## 1. Bản Kê Khai Toàn Diện Các Tiêu Đề An Ninh Sản Xuất

```http
# 1. Bắt buộc HTTPS 100% trong 1 năm kèm toàn bộ Subdomains và ghi danh vào trình duyệt
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# 2. Ngăn chặn triệt để XSS và tiêm mã độc bằng cơ chế Nonce ngẫu nhiên
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m123' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';

# 3. Chống rò rỉ đường dẫn URL nội bộ trong Header Referer
Referrer-Policy: strict-origin-when-cross-origin

# 4. Ngăn chặn trình duyệt đoán định dạng sai (MIME-Sniffing) biến file ảnh thành file JS độc
X-Content-Type-Options: nosniff

# 5. Khóa chặt các phần cứng và API nhạy cảm của thiết bị người dùng
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# 6. Cô lập tiến trình trình duyệt chống rò rỉ bộ nhớ qua lỗ hổng phần cứng Spectre/Meltdown
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-site
```

---

## 2. Content Security Policy Hiện Đại: Nonce-Based & Strict Dynamic

Trước đây, lập trình viên thường dùng CSP dựa trên danh sách trắng tên miền (Domain Whitelist):
```http
# LỖ HỔNG LỖI THỜI:
Content-Security-Policy: script-src 'self' https://cdnjs.cloudflare.com;
```
- **Bẫy nguy hiểm:** Hacker có thể tìm thấy một thư viện chứa lỗi XSS (như AngularJS 1.x) trên `cdnjs.cloudflare.com` và tải nó vào trang web của bạn để thực thi mã độc (Bypass CSP).

### Giải Pháp Hiện Đại: Nonce-Based CSP
1. Máy chủ sinh ra một chuỗi ngẫu nhiên (Cryptographic Nonce) duy nhất cho **MỖI REQUEST HTTP** (ví dụ: `nonce = crypto.randomBytes(16).toString('base64')`).
2. Máy chủ gắn nonce này vào tiêu đề CSP: `script-src 'nonce-abc123xyz' 'strict-dynamic'`.
3. Chỉ những thẻ `<script>` nào trên HTML có thuộc tính `nonce="abc123xyz"` mới được trình duyệt cho phép chạy:
   ```html
   <!-- Chạy thành công vì có nonce hợp lệ của request này -->
   <script nonce="abc123xyz" src="/app.js"></script>

   <!-- BỊ TRÌNH DUYỆT CHẶN ĐỨNG NGAY LẬP TỨC vì không có nonce! -->
   <script>alert('XSS Payload do hacker tiêm vào form bình luận')</script>
   ```

---

## 3. Tiền Tố Cookie An Toàn Cao Cấp: `__Host-` & `__Secure-`

Hacker có thể thực hiện tấn công **Cookie Toss** từ một subdomain bị chiếm quyền (ví dụ `sub.example.com` ghi đè cookie của `example.com`). Để ngăn chặn điều này, các trình duyệt hiện đại hỗ trợ hai tiền tố đặc biệt:

| Tiền tố Cookie | Yêu cầu bắt buộc từ trình duyệt | Mối đe dọa bị triệt tiêu |
| :--- | :--- | :--- |
| `__Secure-` | Bắt buộc phải có cờ `Secure` (chỉ truyền qua HTTPS). | Bị nghe lén trên mạng HTTP bản rõ. |
| `__Host-` | Bắt buộc: 1. Có cờ `Secure`, 2. Gửi từ HTTPS, 3. **KHÔNG được có thuộc tính `Domain`** (chỉ áp dụng cho đúng Host hiện tại), 4. `Path=/`. | **Tuyệt đối chống giả mạo cookie từ các subdomains** (Defeats Subdomain Cookie Overwrite). |

```javascript
// Thiết lập Cookie phiên siêu an toàn:
res.setHeader('Set-Cookie', [
  '__Host-session_id=s_xyz987; Path=/; Secure; HttpOnly; SameSite=Strict'
]);
```
