/**
 * JavaScript Arrow Functions & Lexical this Demo
 * Thực nghiệm Lexical this, cạm bẫy object method, lỗi constructor new, và tính miễn nhiễm với call/bind.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CÚ PHÁP TRẢ VỀ OBJECT LITERAL BẰNG NGOẶC ĐƠN () ===");
// Thân hàm ngoặc nhọn bị hiểu nhầm là khối lệnh block body:
const makeBadUser = (name) => { name: name };
assert.strictEqual(makeBadUser("Alice"), undefined);

// Bọc trong cặp ngoặc đơn () trả về object chuẩn:
const makeGoodUser = (name) => ({ name: name });
const userObj = makeGoodUser("Alice");
assert.deepStrictEqual(userObj, { name: "Alice" });
console.log("makeBadUser('Alice') :", makeBadUser("Alice"));
console.log("makeGoodUser('Alice'):", userObj);
console.log("-> Kiểm chứng Object Literal Return: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY OBJECT METHOD DÙNG ARROW FUNCTION ===");
const dev = {
  name: "Antigravity",
  // LỖI: Arrow function kế thừa this ngoài cùng (module/global)
  greetArrow: () => {
    return typeof this !== "undefined" ? this.name : undefined;
  },
  // ĐÚNG: ES6 Method shorthand ràng buộc this động vào object 'dev'
  greetMethod() {
    return `Hello, ${this.name}!`;
  }
};

console.log("dev.greetArrow() :", dev.greetArrow());  // undefined
console.log("dev.greetMethod():", dev.greetMethod()); // "Hello, Antigravity!"
assert.strictEqual(dev.greetArrow(), undefined);
assert.strictEqual(dev.greetMethod(), "Hello, Antigravity!");
console.log("-> Kiểm chứng Object Method this Pitfall: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: ARROW FUNCTION KHÔNG PHẢI LÀ CONSTRUCTOR ===");
const ArrowConstructor = () => {};

// Không có thuộc tính prototype:
assert.strictEqual(ArrowConstructor.prototype, undefined);

// Ném TypeError khi gọi với từ khóa 'new':
assert.throws(() => {
  // @ts-ignore
  return new ArrowConstructor();
}, TypeError);
console.log("ArrowConstructor.prototype:", ArrowConstructor.prototype);
console.log("new ArrowConstructor() ném TypeError đúng chuẩn ECMAScript.");
console.log("-> Kiểm chứng Constructor & Prototype Limitation: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: ARROW FUNCTION MIỄN NHIỄM VỚI CALL / APPLY / BIND ===");
const globalOrModuleThis = this;

const lexicalArrow = () => {
  return this;
};

const fakeContext = { custom: "INJECTED_CONTEXT" };

// Thử đổi this bằng .call()
const callResult = lexicalArrow.call(fakeContext);
assert.strictEqual(callResult, globalOrModuleThis, "call() không thể thay đổi this của arrow function!");

// Thử đổi this bằng .bind()
const boundArrow = lexicalArrow.bind(fakeContext);
assert.strictEqual(boundArrow(), globalOrModuleThis, "bind() không thể thay đổi this của arrow function!");
console.log("lexicalArrow.call(fakeContext) === globalOrModuleThis:", callResult === globalOrModuleThis);
console.log("-> Kiểm chứng Call/Bind Immunity: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BẢO TOÀN THIS TRONG CALLBACK / TIMER ===");
function TaskManager(taskName) {
  this.taskName = taskName;
  this.status = "PENDING";
}

TaskManager.prototype.runTask = function () {
  // Arrow function bảo toàn 'this' trỏ vào instance TaskManager:
  const updateStatus = () => {
    this.status = "COMPLETED";
    return `${this.taskName} is ${this.status}`;
  };
  return updateStatus();
};

const myTask = new TaskManager("Data Backup");
const statusReport = myTask.runTask();
console.log("myTask report:", statusReport);
assert.strictEqual(myTask.status, "COMPLETED");
assert.strictEqual(statusReport, "Data Backup is COMPLETED");
console.log("-> Kiểm chứng Lexical this Callback Preservation: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Arrow Function & this đã vượt qua thành công! ");
console.log("==========================================");
