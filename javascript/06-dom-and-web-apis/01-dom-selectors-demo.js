/**
 * JavaScript DOM Architecture & Selectors Demo
 * Thực nghiệm mô hình phân cấp DOM Node vs Element,
 * cơ chế Live HTMLCollection vs Static NodeList, và thuật toán closest().
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: PHÂN BIỆT NODE VS ELEMENT (CHILDNODES VS CHILDREN) ===");

// Xây dựng cấu trúc phần tử giả lập chuẩn kiến trúc DOM:
class MockNode {
  constructor(nodeType, nodeName) {
    this.nodeType = nodeType; // 1: Element, 3: Text, 8: Comment
    this.nodeName = nodeName;
    this.parentNode = null;
    this.childNodes = [];
  }

  appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
}

class MockElement extends MockNode {
  constructor(tagName, className = "", id = "") {
    super(1, tagName.toUpperCase());
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.id = id;
  }

  get children() {
    // Chỉ lấy các con là Element (nodeType === 1), bỏ qua Text/Comment:
    return this.childNodes.filter(node => node.nodeType === 1);
  }

  closest(selector) {
    // Duyệt ngược lên trên tổ tiên:
    let current = this;
    while (current && current.nodeType === 1) {
      if (
        (selector.startsWith(".") && current.className.split(" ").includes(selector.slice(1))) ||
        (selector.startsWith("#") && current.id === selector.slice(1)) ||
        (current.tagName.toLowerCase() === selector.toLowerCase())
      ) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }
}

class MockTextNode extends MockNode {
  constructor(text) {
    super(3, "#text");
    this.textContent = text;
  }
}

// Tạo cấu trúc: <div> \n <span>Text</span> \n </div>
const div = new MockElement("div", "container");
div.appendChild(new MockTextNode("\n  ")); // Text Node khoảng trắng
const span = new MockElement("span", "highlight", "label-1");
div.appendChild(span);
div.appendChild(new MockTextNode("\n"));    // Text Node xuống dòng

// childNodes bao gồm cả 3 nodes (Text + Element + Text):
assert.strictEqual(div.childNodes.length, 3);

// children CHỈ chứa đúng 1 Element (span):
assert.strictEqual(div.children.length, 1);
assert.strictEqual(div.children[0].tagName, "SPAN");

console.log("div.childNodes.length (bao gồm khoảng trắng):", div.childNodes.length);
console.log("div.children.length (chỉ tính thẻ HTML):", div.children.length);
console.log("-> Kiểm chứng phân biệt Node vs Element: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: LIVE HTMLCOLLECTION VS STATIC NODELIST ===");

class MockDocument {
  constructor() {
    this.allElements = [];
  }

  createElement(tag, className = "") {
    const el = new MockElement(tag, className);
    this.allElements.push(el);
    return el;
  }

  // Live Collection: Trả về một đối tượng tự động phản ánh danh sách hiện tại
  getElementsByClassName(className) {
    const doc = this;
    return {
      get length() {
        return doc.allElements.filter(e => e.className === className).length;
      },
      item(index) {
        return doc.allElements.filter(e => e.className === className)[index];
      }
    };
  }

  // Static NodeList: Chụp ảnh trạng thái cố định (Snapshot)
  querySelectorAll(className) {
    const snapshot = this.allElements.filter(e => e.className === className);
    return Object.freeze([...snapshot]);
  }
}

const doc = new MockDocument();
const item1 = doc.createElement("li", "item");
const item2 = doc.createElement("li", "item");

const liveCollection = doc.getElementsByClassName("item");
const staticNodeList = doc.querySelectorAll("item");

assert.strictEqual(liveCollection.length, 2);
assert.strictEqual(staticNodeList.length, 2);

// Thêm phần tử thứ 3 vào tài liệu:
const item3 = doc.createElement("li", "item");

// Live Collection tự động nhảy số lên 3:
assert.strictEqual(liveCollection.length, 3);

// Static NodeList VẪN GIỮ NGUYÊN 2 (Bảo toàn tính snapshot an toàn khi duyệt vòng lặp):
assert.strictEqual(staticNodeList.length, 2);

console.log("Live HTMLCollection length sau khi thêm item3:", liveCollection.length);
console.log("Static NodeList length sau khi thêm item3 (vẫn giữ snapshot):", staticNodeList.length);
console.log("-> Kiểm chứng Live vs Static DOM Collections: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: ĐIỀU HƯỚNG TỔ TIÊN VỚI CLOSEST() ===");
// span nằm trong div .container
const matchedContainer = span.closest(".container");
assert.strictEqual(matchedContainer, div);

// Tìm kiếm chính nó nếu khớp:
const matchedSelf = span.closest(".highlight");
assert.strictEqual(matchedSelf, span);

// Tìm kiếm không tồn tại trả về null:
const notFound = span.closest(".non-existent-class");
assert.strictEqual(notFound, null);

console.log("span.closest('.container') tìm thấy chính xác div cha.");
console.log("-> Kiểm chứng phương thức closest(): Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra DOM Selectors đã vượt qua thành công! ");
console.log("==========================================");
