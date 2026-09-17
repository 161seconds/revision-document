/**
 * JavaScript DOM Manipulation & Style Management Demo
 * Thực nghiệm bảo mật textContent chống XSS, bộ công cụ classList,
 * chuyển đổi dataset camelCase, và các phương thức chèn DOM hiện đại.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: BẢO MẬT TEXTCONTENT CHỐNG TẤN CÔNG XSS ===");

class MockDomElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.classList = new MockClassList();
    this.dataset = {};
    this._textContent = "";
    this._innerHTML = "";
  }

  set textContent(text) {
    // textContent KHÔNG BAO GIỜ parse thẻ HTML -> Thoát ký tự an toàn tuyệt đối:
    this._textContent = String(text);
    this._innerHTML = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  get textContent() {
    return this._textContent;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = String(html);
    this._textContent = html.replace(/<[^>]+>/g, ""); // Parse thô
  }

  append(...items) {
    for (const item of items) {
      if (typeof item === "string") {
        const textNode = new MockDomElement("#text");
        textNode.textContent = item;
        this.children.push(textNode);
      } else {
        this.children.push(item);
      }
    }
  }
}

class MockClassList {
  constructor() {
    this._classes = new Set();
  }

  add(...classNames) {
    classNames.forEach(c => this._classes.add(c));
  }

  remove(...classNames) {
    classNames.forEach(c => this._classes.delete(c));
  }

  contains(className) {
    return this._classes.has(className);
  }

  toggle(className) {
    if (this._classes.has(className)) {
      this._classes.delete(className);
      return false; // Trả về false khi class bị gỡ
    } else {
      this._classes.add(className);
      return true; // Trả về true khi class được thêm
    }
  }

  replace(oldClass, newClass) {
    if (this._classes.has(oldClass)) {
      this._classes.delete(oldClass);
      this._classes.add(newClass);
      return true;
    }
    return false;
  }

  toString() {
    return [...this._classes].join(" ");
  }
}

// 1. Kiểm chứng XSS với textContent:
const maliciousPayload = `<script>alert("Hacked")</script>`;
const container = new MockDomElement("div");
container.textContent = maliciousPayload;

// Thẻ script bị escape hoàn toàn trong innerHTML:
assert.strictEqual(container.innerHTML.includes("&lt;script&gt;"), true);
assert.strictEqual(container.textContent, maliciousPayload);
console.log("Mã độc được vô hiệu hóa thành công:", container.innerHTML);
console.log("-> Kiểm chứng an toàn XSS: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: BỘ CÔNG CỤ CLASSLIST (ADD, REMOVE, TOGGLE, REPLACE) ===");
const btn = new MockDomElement("button");

// 1. Thêm nhiều class cùng lúc:
btn.classList.add("btn", "btn-primary");
assert.strictEqual(btn.classList.contains("btn"), true);
assert.strictEqual(btn.classList.contains("btn-primary"), true);

// 2. Toggle class:
const isAdded = btn.classList.toggle("active");
assert.strictEqual(isAdded, true);
assert.strictEqual(btn.classList.contains("active"), true);

const isRemoved = btn.classList.toggle("active");
assert.strictEqual(isRemoved, false);
assert.strictEqual(btn.classList.contains("active"), false);

// 3. Replace class:
btn.classList.replace("btn-primary", "btn-secondary");
assert.strictEqual(btn.classList.contains("btn-primary"), false);
assert.strictEqual(btn.classList.contains("btn-secondary"), true);

console.log("classList hiện tại:", btn.classList.toString());
console.log("-> Kiểm chứng classList API: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: DATASET CHUYỂN ĐỔI CAMELCASE TỪ DATA-* ===");
function parseDataset(attributes) {
  const dataset = {};
  for (const [attrName, val] of Object.entries(attributes)) {
    if (attrName.startsWith("data-")) {
      // Chuyển data-product-id thành productId:
      const camelKey = attrName
        .slice(5)
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      dataset[camelKey] = String(val);
    }
  }
  return dataset;
}

const rawAttributes = {
  "data-product-id": "SKU-500",
  "data-is-in-stock": "true",
  "id": "my-btn"
};

const parsedData = parseDataset(rawAttributes);
assert.strictEqual(parsedData.productId, "SKU-500");
assert.strictEqual(parsedData.isInStock, "true");
// @ts-ignore
assert.strictEqual(parsedData.id, undefined);

console.log("dataset sau khi chuyển sang camelCase:", parsedData);
console.log("-> Kiểm chứng dataset mapping: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: PHƯƠNG THỨC CHÈN HIỆN ĐẠI (APPEND) ===");
const list = new MockDomElement("ul");
const li1 = new MockDomElement("li");
li1.textContent = "Mục 1";

// append nhận cả element lẫn chuỗi văn bản cùng lúc:
list.append(li1, "Khoảng cách thô", new MockDomElement("li"));
assert.strictEqual(list.children.length, 3);
assert.strictEqual(list.children[0].textContent, "Mục 1");
assert.strictEqual(list.children[1].textContent, "Khoảng cách thô");

console.log("-> Kiểm chứng append() nhận nhiều phần tử: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra DOM Manipulation đã vượt qua thành công! ");
console.log("==========================================");
