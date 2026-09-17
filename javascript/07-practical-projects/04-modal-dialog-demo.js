/**
 * 04-modal-dialog-demo.js
 * Chạy độc lập: node 04-modal-dialog-demo.js
 * Kiểm chứng kiến trúc Hộp thoại Modal chuẩn Accessibility (a11y):
 * 1. Focus Trapping Engine (Bẫy tiêu điểm bàn phím phím Tab & Shift+Tab)
 * 2. Phục hồi Focus (Focus Restoration về Trigger Button khi đóng)
 * 3. Ngăn cuộn trang nền (Body Scroll Lock)
 * 4. Thoát an toàn bằng phím Escape & Click Backdrop
 * 5. Chuẩn sự kiện Native <dialog> (cancel, close, returnValue)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 04: ACCESSIBLE MODAL DIALOG ===");

// -------------------------------------------------------------
// 1. FOCUS TRAPPING ALGORITHM (BẪY TIÊU ĐIỂM)
// -------------------------------------------------------------
// Khi Modal mở ra, người dùng nhấn phím Tab hoặc Shift+Tab TUYỆT ĐỐI không được
// nhảy focus ra các nút hay link ngoài trang nền.

class FocusTrapManager {
  constructor(focusableElements = []) {
    this.elements = focusableElements;
    this.currentIndex = 0;
  }

  handleTabKey({ shiftKey = false }) {
    if (this.elements.length === 0) return null;

    if (shiftKey) {
      // Shift + Tab: Đi lùi
      if (this.currentIndex <= 0) {
        // Vòng lại phần tử cuối cùng
        this.currentIndex = this.elements.length - 1;
      } else {
        this.currentIndex--;
      }
    } else {
      // Tab thường: Đi tiến
      if (this.currentIndex >= this.elements.length - 1) {
        // Vòng lại phần tử đầu tiên
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
    }

    return this.elements[this.currentIndex];
  }

  getCurrentFocused() {
    return this.elements[this.currentIndex] || null;
  }
}

const focusTrap = new FocusTrapManager(["btn-close", "input-name", "btn-submit"]);

// Bắt đầu tại nút đầu tiên (btn-close)
assert.equal(focusTrap.getCurrentFocused(), "btn-close");

// Nhấn Tab: sang input-name
assert.equal(focusTrap.handleTabKey({ shiftKey: false }), "input-name");

// Nhấn Tab: sang btn-submit (phần tử cuối)
assert.equal(focusTrap.handleTabKey({ shiftKey: false }), "btn-submit");

// Nhấn Tab một lần nữa: Bẫy vòng lặp lại phần tử đầu tiên (btn-close)
assert.equal(focusTrap.handleTabKey({ shiftKey: false }), "btn-close", "Bẫy Tab thành công!");

// Nhấn Shift+Tab: Đi ngược lại phần tử cuối (btn-submit)
assert.equal(focusTrap.handleTabKey({ shiftKey: true }), "btn-submit", "Bẫy Shift+Tab thành công!");

// -------------------------------------------------------------
// 2. MODAL LIFECYCLE VÀ FOCUS RESTORATION
// -------------------------------------------------------------
class AccessibleModalEngine {
  constructor() {
    this.isOpen = false;
    this.previouslyFocusedElement = null;
    this.isBodyScrollLocked = false;
    this.returnValue = "";
  }

  open({ triggerElement = null } = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.previouslyFocusedElement = triggerElement;
    this.isBodyScrollLocked = true; // Khóa cuộn trang
  }

  close(returnValue = "") {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.isBodyScrollLocked = false; // Mở khóa cuộn trang
    this.returnValue = returnValue;

    const restoredElement = this.previouslyFocusedElement;
    this.previouslyFocusedElement = null;
    return restoredElement; // Trả lại focus cho nút đã kích hoạt mở modal
  }

  handleBackdropClick(clickTarget, dialogContainer) {
    // Nếu click trúng chính thẻ dialog hoặc overlay (chứ không phải nội dung bên trong)
    if (clickTarget === dialogContainer) {
      this.close("backdrop_dismissed");
      return true;
    }
    return false;
  }

  handleKeyDown(key) {
    if (key === "Escape" && this.isOpen) {
      this.close("cancelled");
      return true;
    }
    return false;
  }
}

const modal = new AccessibleModalEngine();

// Giả lập người dùng bấm nút "btn-open-settings" trên thanh Menu
modal.open({ triggerElement: "btn-open-settings" });

assert.equal(modal.isOpen, true);
assert.equal(modal.isBodyScrollLocked, true, "Trang nền phải bị khóa cuộn");
assert.equal(modal.previouslyFocusedElement, "btn-open-settings");

// Nhấn Escape để đóng modal
const isEscHandled = modal.handleKeyDown("Escape");
assert.equal(isEscHandled, true);
assert.equal(modal.isOpen, false);
assert.equal(modal.isBodyScrollLocked, false, "Trang nền được mở cuộn trở lại");
assert.equal(modal.returnValue, "cancelled");

// Mở lại và kiểm tra đóng bằng Backdrop Click
modal.open({ triggerElement: "btn-delete-account" });
const dialogEl = { name: "DIALOG_ELEMENT" };
const contentCardEl = { name: "CARD_CONTENT" };

// Click bên trong nội dung card: Không được đóng
assert.equal(modal.handleBackdropClick(contentCardEl, dialogEl), false);
assert.equal(modal.isOpen, true);

// Click ngoài vùng trống (trúng backdrop): Đóng thành công
assert.equal(modal.handleBackdropClick(dialogEl, dialogEl), true);
assert.equal(modal.isOpen, false);
assert.equal(modal.returnValue, "backdrop_dismissed");

console.log("-> 100% tests cho Accessible Modal Dialog đã pass thành công!");
