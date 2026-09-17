/**
 * 04-html-first-demo.js
 * Chạy độc lập: node 04-html-first-demo.js
 * Kiểm chứng tư duy HTML-First & Progressive Enhancement:
 * 1. Semantic Elements thay thế JS (Native state machine)
 * 2. Constraint Validation API (validity object, checkValidity, customError)
 * 3. FormData API native (Node 18+ có sẵn global FormData)
 * 4. Progressive Enhancement Pattern (Fallback cơ chế khi JS hỏng/tắt)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 04: HTML-FIRST & PROGRESSIVE ENHANCEMENT ===");

// -------------------------------------------------------------
// 1. TƯ DUY HTML-FIRST: SEMANTIC STATE MACHINE KHÔNG CẦN JS
// -------------------------------------------------------------
// Trong HTML hiện đại, nhiều element có sẵn internal state machine của trình duyệt:
// - <details> và <summary>: Đóng mở accordion nội tại (thuộc tính `open`)
// - <dialog>: Modal native với modal stack (showModal vs show)
// - <input type="checkbox"> / :checked: Toggle state không cần class JS
class SimulatedDetailsElement {
  constructor(isOpen = false) {
    this.open = isOpen;
  }
  toggle() {
    // Trình duyệt tự đảo trạng thái mà không cần bất kỳ dòng code JS nào
    this.open = !this.open;
    return this.open;
  }
}

const details = new SimulatedDetailsElement(false);
assert.equal(details.open, false);
details.toggle(); // User click <summary>
assert.equal(details.open, true, "Native details tự mở không cần JS listener");

// -------------------------------------------------------------
// 2. CONSTRAINT VALIDATION API (Browser-Native Form Validation)
// -------------------------------------------------------------
// Thay vì viết Regex hay library cồng kềnh (Joi, Yup) cho form cơ bản,
// Trình duyệt có sẵn ValidityState object:
// - valueMissing (:required)
// - typeMismatch (:type="email|url")
// - patternMismatch (:pattern)
// - tooShort / tooLong (:minlength / :maxlength)
// - rangeUnderflow / rangeOverflow (:min / :max)
// - customError (thông qua setCustomValidity)
// - valid (tổng hợp: true nếu toàn bộ flags đều false)

class SimulatedInput {
  constructor({ type = "text", value = "", required = false, pattern = null }) {
    this.type = type;
    this.value = value;
    this.required = required;
    this.pattern = pattern;
    this._customErrorMessage = "";
  }

  get validity() {
    const valueMissing = this.required && (!this.value || this.value.trim() === "");
    let typeMismatch = false;
    if (this.type === "email" && this.value) {
      // Chuẩn HTML5 email regex đơn giản
      typeMismatch = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    }
    let patternMismatch = false;
    if (this.pattern && this.value) {
      patternMismatch = !this.pattern.test(this.value);
    }
    const customError = this._customErrorMessage.length > 0;

    const isValid = !valueMissing && !typeMismatch && !patternMismatch && !customError;

    return {
      valueMissing,
      typeMismatch,
      patternMismatch,
      customError,
      valid: isValid,
    };
  }

  get validationMessage() {
    if (this._customErrorMessage) return this._customErrorMessage;
    if (this.validity.valueMissing) return "Please fill out this field.";
    if (this.validity.typeMismatch) return "Please enter a valid email address.";
    if (this.validity.patternMismatch) return "Please match the requested format.";
    return "";
  }

  setCustomValidity(message) {
    this._customErrorMessage = message || "";
  }

  checkValidity() {
    return this.validity.valid;
  }
}

// Test validation chuẩn của browser
const emailInput = new SimulatedInput({ type: "email", required: true, value: "" });
assert.equal(emailInput.checkValidity(), false, "Input required rỗng phải invalid");
assert.equal(emailInput.validity.valueMissing, true);

// Nhập sai format email
emailInput.value = "invalid-email";
assert.equal(emailInput.checkValidity(), false);
assert.equal(emailInput.validity.typeMismatch, true);
assert.equal(emailInput.validity.valueMissing, false);

// Nhập đúng format
emailInput.value = "dev@example.com";
assert.equal(emailInput.checkValidity(), true);
assert.equal(emailInput.validity.valid, true);

// Custom Error qua setCustomValidity
emailInput.setCustomValidity("Email này thuộc domain bị cấm!");
assert.equal(emailInput.checkValidity(), false, "setCustomValidity biến input thành invalid");
assert.equal(emailInput.validity.customError, true);
assert.equal(emailInput.validationMessage, "Email này thuộc domain bị cấm!");

// Xóa custom error
emailInput.setCustomValidity("");
assert.equal(emailInput.checkValidity(), true);

// -------------------------------------------------------------
// 3. FORMDATA API NATIVE (Node.js 18+ Global)
// -------------------------------------------------------------
// Không cần bóc tách từng input bằng JS querySelector thủ công.
// Native FormData thu thập toàn bộ name=value trong form một cách hoàn hảo.
const formData = new FormData();
formData.append("username", "alice");
formData.append("roles", "admin");
formData.append("roles", "editor");

assert.equal(formData.get("username"), "alice");
// Lấy toàn bộ mảng giá trị trùng tên
assert.deepEqual(formData.getAll("roles"), ["admin", "editor"]);

// Chuyển FormData sang URLSearchParams hoặc JSON cực nhanh
const params = new URLSearchParams(formData);
assert.equal(params.get("username"), "alice");

// -------------------------------------------------------------
// 4. PROGRESSIVE ENHANCEMENT PIPELINE
// -------------------------------------------------------------
// Nguyên tắc:
// 1. Tầng 1 (HTML): Form có action="/api/submit" method="POST" -> Submit chuẩn không cần JS.
// 2. Tầng 2 (CSS): Styling giao diện đẹp, responsive.
// 3. Tầng 3 (JS): Chặn submit (e.preventDefault()), fetch() ngầm qua AJAX (SPA/PWA),
//    nếu JS bị lỗi hay crash mạng, form fallback quay về cơ chế Tầng 1 submit native!

function processFormSubmission({ hasJavaScript, inputData, networkOnline }) {
  if (!hasJavaScript) {
    // Tầng 1: Native HTML Form Action (Trình duyệt tự tải trang tiếp)
    return {
      mode: "HTML_NATIVE_SUBMIT",
      statusCode: 200,
      payload: inputData,
    };
  }

  // Tầng 3: Progressive Enhancement với AJAX / Fetch
  try {
    if (!networkOnline) {
      throw new Error("Network offline");
    }
    return {
      mode: "AJAX_PROGRESSIVE_ENHANCED",
      statusCode: 200,
      payload: inputData,
    };
  } catch {
    // Fallback: Khi JS request thất bại, trả về chỉ dẫn submit qua form native
    return {
      mode: "FALLBACK_TO_HTML_SUBMIT",
      statusCode: 503,
      fallbackAction: "/api/submit",
    };
  }
}

// Khi JS bị chặn/tắt (NoScript / Cáp quang đứt / Lỗi parse script)
const noJsResult = processFormSubmission({
  hasJavaScript: false,
  inputData: { user: "john" },
  networkOnline: true,
});
assert.equal(noJsResult.mode, "HTML_NATIVE_SUBMIT", "Không có JS trang vẫn submit được");

// Khi có JS hoạt động hoàn hảo
const jsResult = processFormSubmission({
  hasJavaScript: true,
  inputData: { user: "john" },
  networkOnline: true,
});
assert.equal(jsResult.mode, "AJAX_PROGRESSIVE_ENHANCED", "Có JS nâng cấp mượt mà không reload");

// Khi JS gặp sự cố mạng
const fallbackResult = processFormSubmission({
  hasJavaScript: true,
  inputData: { user: "john" },
  networkOnline: false,
});
assert.equal(fallbackResult.mode, "FALLBACK_TO_HTML_SUBMIT", "Graceful fallback khi fetch gặp nạn");

console.log("-> 100% tests cho HTML-First & Progressive Enhancement đã pass thành công!");
