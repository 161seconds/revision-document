# OpenID Connect (OIDC) & ID Tokens

OAuth 2.0 vốn được thiết kế thuần túy cho bài toán **Cấp quyền (Authorization)**: "Ứng dụng này có quyền đọc danh bạ của bạn". OAuth 2.0 hoàn toàn không trả lời câu hỏi: "Người dùng đang đăng nhập này là ai?".

**OpenID Connect (OIDC)** là một tầng định danh (Identity Layer) được xây dựng đè lên trên nền tảng của OAuth 2.0, biến OAuth 2.0 thành một chuẩn xác thực đăng nhập một lần (Single Sign-On - SSO) toàn diện.

---

## 1. Phân Biệt Tuyệt Đối: `id_token` vs `access_token`

| Tiêu Chí | `id_token` (OIDC) | `access_token` (OAuth 2.0) |
| :--- | :--- | :--- |
| **Mục Đích Sử Dụng** | **Xác thực định danh (Authentication)**: Chứng minh người dùng đã đăng nhập thành công. | **Cấp quyền (Authorization)**: Cấp quyền gọi API tài nguyên. |
| **Đối Tượng Đọc (Audience)** | **Client Application** (Website hoặc Mobile App của bạn). | **Resource Server / API Gateway** (Không dành cho Client đọc). |
| **Định Dạng Dữ Liệu** | **Bắt buộc là JSON Web Token (JWT)** có chữ ký số. | Bất kỳ (Có thể là chuỗi ngẫu nhiên Opaque Token hoặc JWT). |
| **Thông Tin Chứa Đựng** | Thông tin hồ sơ người dùng (`sub`, `email`, `name`, `auth_time`). | Danh sách quyền hạn (`scope: ["read:orders", "write:profile"]`). |
| **Cấm Kỵ Nghiêm Ngặt** | **KHÔNG BAO GIỜ** gửi `id_token` trong header `Authorization: Bearer` tới API Resource Server! | Được gửi trong header `Authorization: Bearer <token>` tới API. |

---

## 2. Các Claims Chuẩn Mực Trong `id_token`

Một `id_token` sau khi giải mã có cấu trúc JSON chứa các trường dữ liệu định danh (Claims):

```json
{
  "iss": "https://accounts.google.com",
  "sub": "109823910293810293",
  "aud": "my-web-app-client-id.apps.googleusercontent.com",
  "exp": 1710003600,
  "iat": 1710000000,
  "auth_time": 1709999950,
  "nonce": "n-0S6_WzA2Mj",
  "email": "alice@security.org",
  "email_verified": true,
  "name": "Alice Wonderland"
}
```

### 2.1 Bốn Quy Tắc Xác Thực Bắt Buộc Của Client
Khi nhận được một `id_token`, Client App **bắt buộc phải kiểm tra 4 điều kiện**:
1. **Chữ ký số (Signature)**: Kiểm tra chữ ký bằng Public Key lấy từ JWKS endpoint của Issuer.
2. **`iss` (Issuer)**: Giá trị phải trùng khớp chính xác $100\%$ với URL của nhà cung cấp danh tính (ví dụ: `https://accounts.google.com`).
3. **`aud` (Audience)**: Giá trị phải trùng khớp với `client_id` mà ứng dụng đã đăng ký với Auth Server. (Tránh kịch bản token được cấp cho ứng dụng khác bị mang sang ứng dụng của bạn!).
4. **`exp` (Expiration Time)**: Thời điểm hiện tại `now()` phải nhỏ hơn `exp`.

---

## 3. OpenID Provider Discovery Endpoint

Làm thế nào để Client App biết địa chỉ của Authorization Endpoint, Token Endpoint và Public Keys?
- OIDC chuẩn hóa một endpoint công khai:
  `https://auth-server.com/.well-known/openid-configuration`
- Endpoint này trả về siêu dữ liệu (Metadata):
  - `authorization_endpoint`: URL chuyển hướng đăng nhập.
  - `token_endpoint`: URL gửi code để lấy token.
  - `jwks_uri`: URL tải danh sách Public Keys để verify chữ ký JWT.
  - `userinfo_endpoint`: URL truy vấn thêm thông tin chi tiết người dùng.
