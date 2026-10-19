// Module 03 Practice: Server Actions & Mutations
// Yêu cầu: Hoàn thành các hàm xử lý Server Action, Quản lý Optimistic State và Xác thực An ninh.

import assert from "node:assert/strict";

/**
 * Bài 1: Kiểm thực dữ liệu và thực thi Server Action
 * - Nhận vào: formDataObj (object), schemaRules (object), dbCallback (async function)
 * - schemaRules hỗ trợ:
 *     - required: boolean (không được rỗng/undefined)
 *     - minLength: number
 *     - isEmail: boolean (phải có '@' và '.')
 * - Nếu không hợp lệ: trả về { success: false, errors: { [field]: string }, data: null }
 * - Nếu hợp lệ: gọi dbCallback và trả về { success: true, errors: null, data: kết quả }
 */
export async function validateAndExecuteServerAction(formDataObj, schemaRules, dbCallback) {
  const errors = {};

  for (const [field, rules] of Object.entries(schemaRules)) {
    const val = formDataObj[field];
    const strVal = val !== undefined && val !== null ? String(val).trim() : "";

    if (rules.required && strVal.length === 0) {
      errors[field] = `${field} là bắt buộc`;
      continue;
    }

    if (rules.minLength && strVal.length < rules.minLength) {
      errors[field] = `${field} phải có ít nhất ${rules.minLength} ký tự`;
      continue;
    }

    if (rules.isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(strVal)) {
        errors[field] = `${field} không đúng định dạng email`;
        continue;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, data: null };
  }

  try {
    const data = await dbCallback(formDataObj);
    return { success: true, errors: null, data };
  } catch (err) {
    return { success: false, errors: { _global: err.message }, data: null };
  }
}

/**
 * Bài 2: Bộ Reducer quản lý trạng thái Cập nhật Lạc quan (Optimistic State Reducer)
 * - 'ADD_PENDING': Thêm item vào danh sách với cờ isPending: true
 * - 'CONFIRM_SUCCESS': Tìm item theo tempId, thay bằng realItem và gỡ cờ isPending
 * - 'ROLLBACK_ERROR': Xóa item có tempId ra khỏi danh sách
 */
export function manageOptimisticState(currentState = [], action) {
  switch (action.type) {
    case "ADD_PENDING":
      return [{ ...action.payload, isPending: true }, ...currentState];

    case "CONFIRM_SUCCESS": {
      const { tempId, realItem } = action.payload;
      return currentState.map((item) =>
        item.id === tempId ? { ...realItem, isPending: false } : item
      );
    }

    case "ROLLBACK_ERROR": {
      const { tempId } = action.payload;
      return currentState.filter((item) => item.id !== tempId);
    }

    default:
      return currentState;
  }
}

/**
 * Bài 3: Kiểm tra an ninh Request gọi Server Action (Security Guard)
 * - Bắt buộc HTTP Method là 'POST'
 * - Bắt buộc có header 'next-action' (không phân biệt chữ hoa/thường)
 * - Chống CSRF: Nếu request có header 'origin', hostname của origin phải khớp với 'host' header
 */
export function verifyNextActionSecurity(request) {
  const method = (request.method || "").toUpperCase();
  if (method !== "POST") {
    return { allowed: false, reason: "Server Action chỉ chấp nhận HTTP POST" };
  }

  // Chuẩn hóa headers sang lowercase
  const headers = {};
  for (const [k, v] of Object.entries(request.headers || {})) {
    headers[k.toLowerCase()] = v;
  }

  if (!headers["next-action"]) {
    return { allowed: false, reason: "Thiếu tiêu đề Next-Action" };
  }

  const origin = headers["origin"];
  const host = headers["host"];

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return { allowed: false, reason: "CSRF Mismatch: Origin không khớp Host" };
      }
    } catch {
      return { allowed: false, reason: "Tiêu đề Origin không hợp lệ" };
    }
  }

  return { allowed: true };
}

// ==========================================
// BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)
// ==========================================
console.log("-> Running Next.js Module 03 Practice Tests...");

// Test 1: validateAndExecuteServerAction
const rules = {
  title: { required: true, minLength: 3 },
  email: { required: true, isEmail: true }
};

const badInput = { title: "Hi", email: "invalid-email" };
const resFail = await validateAndExecuteServerAction(badInput, rules, async () => ({ id: 1 }));
assert.equal(resFail.success, false);
assert.ok(resFail.errors.title);
assert.ok(resFail.errors.email);

const goodInput = { title: "Next.js 15 Guide", email: "dev@example.com" };
const resSuccess = await validateAndExecuteServerAction(goodInput, rules, async (data) => ({
  id: 101,
  ...data
}));
assert.equal(resSuccess.success, true);
assert.equal(resSuccess.data.id, 101);
assert.equal(resSuccess.errors, null);

// Test 2: manageOptimisticState
let state = [{ id: "item-1", text: "Bài viết cũ", isPending: false }];

// Thêm lạc quan
state = manageOptimisticState(state, {
  type: "ADD_PENDING",
  payload: { id: "temp-99", text: "Bài viết mới đang gửi" }
});
assert.equal(state.length, 2);
assert.equal(state[0].id, "temp-99");
assert.equal(state[0].isPending, true);

// Xác nhận thành công
state = manageOptimisticState(state, {
  type: "CONFIRM_SUCCESS",
  payload: {
    tempId: "temp-99",
    realItem: { id: "real-202", text: "Bài viết mới đang gửi" }
  }
});
assert.equal(state.length, 2);
assert.equal(state[0].id, "real-202");
assert.equal(state[0].isPending, false);

// Thêm lỗi và rollback
state = manageOptimisticState(state, {
  type: "ADD_PENDING",
  payload: { id: "temp-error", text: "Bài viết lỗi" }
});
assert.equal(state.length, 3);

state = manageOptimisticState(state, {
  type: "ROLLBACK_ERROR",
  payload: { tempId: "temp-error" }
});
assert.equal(state.length, 2);
assert.equal(state.find((i) => i.id === "temp-error"), undefined);

// Test 3: verifyNextActionSecurity
const validReq = {
  method: "POST",
  headers: {
    "Next-Action": "c8f921da84",
    Origin: "https://my-app.com",
    Host: "my-app.com"
  }
};
assert.equal(verifyNextActionSecurity(validReq).allowed, true);

const invalidMethodReq = {
  method: "GET",
  headers: { "Next-Action": "123" }
};
assert.equal(verifyNextActionSecurity(invalidMethodReq).allowed, false);

const csrfAttackReq = {
  method: "POST",
  headers: {
    "Next-Action": "c8f921da84",
    Origin: "https://evil-attacker.com",
    Host: "my-app.com"
  }
};
const csrfRes = verifyNextActionSecurity(csrfAttackReq);
assert.equal(csrfRes.allowed, false);
assert.match(csrfRes.reason, /CSRF Mismatch/);

console.log("✅ All Next.js Module 03 practice tests passed successfully!");
