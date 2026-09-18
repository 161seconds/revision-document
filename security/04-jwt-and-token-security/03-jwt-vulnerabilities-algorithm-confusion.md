# Critical JWT Vulnerabilities: Algorithm Confusion & None Alg

Do tính chất linh hoạt của chuẩn JWT (cho phép chỉ định thuật toán ký ngay trong Header), các thư viện JWT cũ hoặc triển khai cẩu thả thường mắc phải các lỗ hổng kinh điển cho phép tin tặc vượt qua cơ chế xác thực.

---

## 1. Lỗ Hổng Thuật Toán "None" (`alg: "none"`)

Chuẩn RFC 7519 ban đầu định nghĩa một thuật toán có tên là `"none"` (dành cho trường hợp token đã được mã hóa ở tầng khác và không cần chữ ký số).

### 1.1 Kịch Bản Khai Thác
1. Kẻ tấn công nhận được một JWT thông thường của tài khoản thường:
   - Header: `{"alg": "HS256", "typ": "JWT"}`
   - Payload: `{"sub": "user123", "role": "USER"}`
2. Kẻ tấn công sửa đổi Payload thành:
   - Payload mới: `{"sub": "user123", "role": "ADMIN"}`
3. Kẻ tấn công sửa đổi Header:
   - Header mới: `{"alg": "none", "typ": "JWT"}`
4. Kẻ tấn công **xóa bỏ hoàn toàn phần Signature thứ 3**:
   `eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6IkFETUlOIn0.` (Lưu ý vẫn giữ dấu chấm ở cuối).
5. **Lỗi của Server**: Thư viện JWT đọc Header, thấy `alg: "none"`, lập tức bỏ qua bước kiểm tra chữ ký và coi token là hợp lệ! Kẻ tấn công biến thành Admin thành công!

### 1.2 Biện Pháp Khắc Phục
> [!IMPORTANT]
> **Tuyệt đối nghiêm cấm thuật toán `none` trong môi trường sản xuất**. Mọi thư viện JWT phải cấu hình tường minh danh sách các thuật toán được phép (`algorithms: ['RS256']`).

---

## 2. Lỗ Hổng Algorithm Confusion (HMAC vs RSA Key Confusion)

Đây là một trong những lỗ hổng tinh vi và nguy hiểm nhất trong lịch sử bảo mật web.

### 2.1 Bản Chất Kỹ Thuật
- Giả sử máy chủ sử dụng thuật toán bất đối xứng **RS256**:
  - Máy chủ dùng RSA Private Key để ký token.
  - Máy chủ công khai RSA Public Key (dưới dạng chuỗi PEM `-----BEGIN PUBLIC KEY-----...`).
- Hàm verify của một thư viện JWT lỗi thời thường có dạng:
```javascript
// ❌ NGUY HIỂM: Hàm verify tin tưởng mù quáng vào Header của Client
jwt.verify(token, serverKey);
```
- Khi `token` có `alg: "RS256"`, thư viện hiểu `serverKey` là RSA Public Key và dùng thuật toán toán học RSA để kiểm tra.
- **Điểm yếu**: Nếu kẻ tấn công đổi `alg` trong Header từ `"RS256"` thành `"HS256"` (HMAC):
  - Thuật toán HMAC coi tham số thứ hai (`serverKey`) là một **chuỗi byte bí mật (Shared Secret)** thuần túy!
  - Kẻ tấn công lấy chính **RSA Public Key công khai** của server (vốn dĩ ai cũng biết), dùng nó làm HMAC Secret Key, và tự ký ra một token mới bằng thuật toán `HS256`!
  - Khi server nhận token, thấy `alg: "HS256"`, server lấy chuỗi Public Key trong tay đem đi băm HMAC. Hai bên khớp nhau hoàn toàn! Kẻ tấn công giả mạo token thành công!

### 2.2 Biện Pháp Khắc Phục Triệt Để
1. **Khóa cứng thuật toán ở tầng Backend**:
   ```javascript
   // ✅ AN TOÀN: Bắt buộc chỉ chấp nhận thuật toán định trước
   jwt.verify(token, publicKey, { algorithms: ['RS256'] });
   ```
   Nếu token gửi lên có `alg: "HS256"` hay `"none"`, thư viện lập tức quăng lỗi và từ chối xử lý.
2. Kiểm tra kiểu của khóa tương ứng với thuật toán trước khi verify.

---

## 3. Tấn Công Bẻ Khóa HMAC Bí Mật Yếu (Weak Secret Brute-Force)

Nếu sử dụng thuật toán đối xứng `HS256` nhưng đặt Secret Key quá ngắn hoặc đơn giản (ví dụ: `secret123`, `jwt_secret`):
- Vì toàn bộ chuỗi JWT là dữ liệu công khai, kẻ tấn công có thể tải token về máy cá nhân và dùng công cụ như **hashcat** hoặc **John the Ripper** để cày offline bằng GPU.
- Một khi tìm ra Secret Key, toàn bộ hệ thống bị xâm nhập hoàn toàn.
- **Khuyến nghị chuẩn mực**: Secret Key cho HMAC-SHA256 bắt buộc phải được sinh bằng CSPRNG ngẫu nhiên có độ dài **tối thiểu 256 bits (32 bytes)**.
