/**
 * 01-variables-scope.js
 * Minh họa sự khác biệt giữa var, let, const và cơ chế Scoping / Hoisting
 */

console.log("=== 1. BLOCK SCOPE VS FUNCTION SCOPE ===");

function testScope() {
  if (true) {
    var functionScoped = "Tôi tồn tại trong toàn bộ hàm testScope";
    let blockScoped = "Tôi chỉ sống trong khối IF này";
    const constScoped = "Tôi cũng chỉ sống trong khối IF này";
  }

  console.log(functionScoped); // OK: var bỏ qua block {}

  try {
    console.log(blockScoped);
  } catch (err) {
    console.log("Lỗi truy cập blockScoped:", err.message); // ReferenceError
  }
}
testScope();

console.log("\n=== 2. HOISTING & TEMPORAL DEAD ZONE (TDZ) ===");

// 1. var được hoisted và gán undefined
console.log("var trước khi khai báo:", hoistedVar); // undefined
var hoistedVar = "Đã gán giá trị";

// 2. let/const được hoisted nhưng nằm trong TDZ
try {
  console.log(tdzLet); // ReferenceError: Cannot access 'tdzLet' before initialization
} catch (err) {
  console.log("Lỗi TDZ của let:", err.message);
}
let tdzLet = "Đã thoát khỏi TDZ";

console.log("\n=== 3. CONST MUTATION (ĐỘNG TRONG TĨNH) ===");

const person = { name: "Alice", age: 25 };
person.age = 26; // HỢP LỆ: Thuộc tính bên trong Object thay đổi được
console.log("Person sau khi đổi tuổi:", person);

// person = { name: "Bob" }; // TypeError: Assignment to constant variable
