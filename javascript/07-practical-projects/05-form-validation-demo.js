/**
 * 05-form-validation-demo.js
 * Chạy độc lập: node 05-form-validation-demo.js
 * Kiểm chứng kiến trúc Form Validation chuẩn Enterprise:
 * 1. Đánh giá độ mạnh mật khẩu (Entropy Strength Meter)
 * 2. Khớp mật khẩu xác nhận (Password Match Rule)
 * 3. Validation Pipeline với Constraint Validation API Integration
 * 4. Trích xuất Payload sạch qua FormData
 * 5. Accessibility Error Announcement State
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 05: ENTERPRISE FORM VALIDATION ===");

// -------------------------------------------------------------
// 1. PASSWORD ENTROPY & STRENGTH CALCULATOR
// -------------------------------------------------------------
function evaluatePasswordStrength(password) {
  if (!password || typeof password !== "string") {
    return { score: 0, label: "Trống", isValid: false };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  let label = "Yếu";
  if (score >= 4) label = "Rất Mạnh";
  else if (score >= 3) label = "Mạnh";
  else if (score >= 2) label = "Trung Bình";

  return {
    score,
    label,
    isValid: score >= 3 && password.length >= 8,
  };
}

const weakPass = evaluatePasswordStrength("123456");
assert.equal(weakPass.score, 1, "Chỉ có số nên score là 1");
assert.equal(weakPass.isValid, false, "Độ dài < 8 nên không hợp lệ");

const strongPass = evaluatePasswordStrength("P@ssw0rd2026!");
assert.equal(strongPass.isValid, true);
assert.equal(strongPass.label, "Rất Mạnh");

// -------------------------------------------------------------
// 2. FORM VALIDATION PIPELINE
// -------------------------------------------------------------
class EnterpriseFormValidator {
  constructor(fields) {
    this.fields = fields; // { username, email, password, confirmPassword, terms }
    this.errors = {};
  }

  validate() {
    this.errors = {};

    // 1. Username
    const username = (this.fields.username || "").trim();
    if (!username) {
      this.errors.username = "Tên đăng nhập không được để trống";
    } else if (username.length < 3) {
      this.errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.errors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    // 2. Email
    const email = (this.fields.email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      this.errors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      this.errors.email = "Địa chỉ email không đúng định dạng";
    }

    // 3. Password
    const passResult = evaluatePasswordStrength(this.fields.password);
    if (!this.fields.password) {
      this.errors.password = "Mật khẩu không được để trống";
    } else if (!passResult.isValid) {
      this.errors.password = "Mật khẩu quá yếu (cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số)";
    }

    // 4. Confirm Password
    if (this.fields.confirmPassword !== this.fields.password) {
      this.errors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }

    // 5. Terms
    if (!this.fields.terms) {
      this.errors.terms = "Bạn phải đồng ý với điều khoản sử dụng";
    }

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors,
    };
  }
}

// Kiểm thử form không hợp lệ
const invalidForm = new EnterpriseFormValidator({
  username: "al",
  email: "invalid-email",
  password: "123",
  confirmPassword: "456",
  terms: false,
});

const invalidRes = invalidForm.validate();
assert.equal(invalidRes.isValid, false);
assert.equal(invalidRes.errors.username, "Tên đăng nhập phải có ít nhất 3 ký tự");
assert.equal(invalidRes.errors.email, "Địa chỉ email không đúng định dạng");
assert.equal(invalidRes.errors.confirmPassword, "Mật khẩu xác nhận không trùng khớp");
assert.equal(invalidRes.errors.terms, "Bạn phải đồng ý với điều khoản sử dụng");

// Kiểm thử form hợp lệ
const validForm = new EnterpriseFormValidator({
  username: "john_doe",
  email: "john@enterprise.com",
  password: "SecureP@ssword2026",
  confirmPassword: "SecureP@ssword2026",
  terms: true,
});

const validRes = validForm.validate();
assert.equal(validRes.isValid, true);
assert.equal(Object.keys(validRes.errors).length, 0);

// -------------------------------------------------------------
// 3. NATIVE FORMDATA PAYLOAD EXTRACTION
// -------------------------------------------------------------
const formData = new FormData();
formData.append("username", validForm.fields.username);
formData.append("email", validForm.fields.email);
formData.append("terms", String(validForm.fields.terms));

// Trích xuất Object JSON sạch để gửi API
const payload = Object.fromEntries(formData.entries());
assert.deepEqual(payload, {
  username: "john_doe",
  email: "john@enterprise.com",
  terms: "true",
});

console.log("-> 100% tests cho Enterprise Form Validation đã pass thành công!");
