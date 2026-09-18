# Password Storage: Argon2id, bcrypt & Adaptive Hashing

Mật khẩu của người dùng không bao giờ được phép lưu trữ dưới dạng bản rõ (Plaintext) hoặc mã hóa có thể đảo ngược (Reversible Encryption). Chúng bắt buộc phải được băm một chiều (One-way Hash) bằng các thuật toán băm mật khẩu thích ứng chuyên dụng.

---

## 1. Tại Sao MD5 / SHA-256 Là Thảm Họa Cho Mật Khẩu?

Các hàm băm như MD5, SHA-1, SHA-256 được thiết kế cho việc kiểm tra tính toàn vẹn của tệp tin hoặc chữ ký số. Chúng được tối ưu hóa cho **TỐC ĐỘ CỰC CAO**:
- Một card đồ họa phổ thông (NVIDIA RTX 4090) có thể tính toán hơn **150 TỶ hàm băm NTLM / MD5 mỗi giây** và hàng tỷ hàm băm SHA-256 mỗi giây.
- Kẻ tấn công có thể vét cạn (Brute-force) một mật khẩu 8 ký tự chỉ trong vòng vài giây!

### Khái Niệm Băm Chậm Thích Ứng (Adaptive Slow Hashing)
Thuật toán băm mật khẩu chuyên dụng phải được thiết kế để **CHẬM CÓ CHỦ ĐÍCH** và tiêu tốn nhiều tài nguyên phần cứng (CPU & RAM), khiến chi phí phần cứng của kẻ tấn công trở nên bất khả thi.

---

## 2. Vai Trò Của Salt (Muối Ngẫu Nhiên)

Nếu hai người dùng cùng đặt mật khẩu là `Password123!`:
- Nếu không có Salt: Giá trị hash của cả hai sẽ giống hệt nhau. Kẻ tấn công dùng **Bảng Cầu Vồng (Rainbow Tables)** tính sẵn hàng triệu hash phổ biến để tra ngược mật khẩu ngay tức thì.
- **Cơ Chế Salting**:
  - Với mỗi người dùng, hệ thống sinh ra một chuỗi ngẫu nhiên bằng bộ sinh số ngẫu nhiên an toàn (`CSPRNG`) có độ dài tối thiểu 16 bytes: `Salt`.
  - Mật khẩu được băm cùng Salt: $\text{Hash} = H(\text{Password} \parallel \text{Salt})$.
  - Chuỗi Salt được lưu công khai cùng bản ghi mật khẩu (ví dụ: `$2b$12$e8...`).
  - **Tác dụng**: Biến mỗi mật khẩu thành duy nhất, vô hiệu hóa $100\%$ các bảng Rainbow Table tính sẵn.

---

## 3. Các Thuật Toán Băm Mật Khẩu Hàng Đầu

### 3.1 Argon2id (Khuyến Nghị Cao Nhất Hiện Nay)
Argon2 là thuật toán chiến thắng cuộc thi Password Hashing Competition (PHC) quốc tế năm 2015.
- **Biến thể Argon2id**: Kết hợp giữa Argon2d (chống tấn công GPU/ASIC brute-force bằng cách phụ thuộc dữ liệu vào bộ nhớ) và Argon2i (chống tấn công kênh phụ - Side-channel attacks).
- **Tính chất Memory-Hard**: Yêu cầu một lượng bộ nhớ RAM lớn để tính toán một hash (ví dụ: `64 MB RAM` cho mỗi lần băm). Vì một card GPU có bộ nhớ chia sẻ hạn chế, nó không thể chạy song song hàng nghìn luồng băm như với SHA-256!

### 3.2 bcrypt (Tiêu Chuẩn Lâu Năm Bền Vững)
- Dựa trên thuật toán mã hóa khối Blowfish, được phát minh năm 1999 bởi Niels Provos và David Mazières.
- Cấu trúc chuỗi hash: `$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
  - `2b`: Phiên bản bcrypt.
  - `12`: Chi phí tính toán (Work Factor / Cost) $= 2^{12} = 4096$ vòng lặp băm.
  - 22 ký tự tiếp theo: Salt ngẫu nhiên.
  - 31 ký tự cuối: Giá trị hash mật khẩu.
- **Khả năng thích ứng**: Khi CPU trong tương lai mạnh hơn, lập trình viên chỉ cần tăng Cost từ 12 lên 14, 16 mà không cần đổi thuật toán.

---

## 4. Bảng So Sánh Các Thuật Toán

| Thuật Toán | Trạng Thái Khuyến Nghị | Chống GPU / ASIC | Chống Side-Channel | Cấu Hình Khuyến Nghị |
| :--- | :--- | :--- | :--- | :--- |
| **Argon2id** | **Tiêu chuẩn số 1 (OWASP / IETF)** | **Cực mạnh** (Memory-hard) | Cực mạnh | Memory: 64MB, Time: 3 iterations, Threads: 4 |
| **bcrypt** | **Được khuyến nghị cao** | Rất tốt (CPU-bound) | Tốt | Cost factor $\ge 12$ (~250ms/hash) |
| **scrypt** | Chấp nhận được | Rất tốt (Memory-hard) | Tốt | $N=32768, r=8, p=1$ |
| **PBKDF2** | Mức tối thiểu chấp nhận | Kém (Dễ bị GPU cày) | Tốt | $\ge 600,000$ vòng (HMAC-SHA256) |
| **MD5 / SHA** | **NGHIÊM CẤM SỬ DỤNG** | 0% (Hàng trăm tỷ hash/s) | 0% | Tuyệt đối không dùng cho password |
