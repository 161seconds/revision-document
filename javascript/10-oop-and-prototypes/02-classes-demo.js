/**
 * 02-classes-demo.js
 * Chạy độc lập: node 02-classes-demo.js
 * Kiểm chứng toàn diện Lớp ES6 (Classes) & Tính đóng gói (Encapsulation):
 * 1. Kế thừa lớp với extends & super()
 * 2. Trường riêng tư thực sự (True Private Fields: #privateField - ES2022)
 * 3. Khối khởi tạo tĩnh (Static Initialization Blocks: static { ... } - ES2022)
 * 4. Bắt buộc gọi bằng toán tử new (Classes are not callable)
 * 5. Tính bảo mật của trường riêng tư: Vô hình trước Object.keys & Reflect
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 02: CLASSES & ENCAPSULATION ===");

// -------------------------------------------------------------
// 1. KẾ THỪA LỚP & SUPER()
// -------------------------------------------------------------
class Vehicle {
  constructor(brand, speed) {
    this.brand = brand;
    this.speed = speed;
  }

  describe() {
    return `${this.brand} đang chạy với tốc độ ${this.speed} km/h`;
  }
}

class ElectricCar extends Vehicle {
  constructor(brand, speed, batteryPercent) {
    super(brand, speed); // Bắt buộc phải gọi super() trước khi dùng this!
    this.battery = batteryPercent;
  }

  describe() {
    return `${super.describe()}, pin còn ${this.battery}%`;
  }
}

const tesla = new ElectricCar("Tesla Model 3", 120, 85);
assert.equal(tesla.describe(), "Tesla Model 3 đang chạy với tốc độ 120 km/h, pin còn 85%");

// -------------------------------------------------------------
// 2. TRƯỜNG & PHƯƠNG THỨC RIÊNG TƯ THỰC SỰ (#privateField - ES2022)
// -------------------------------------------------------------
class SecureVault {
  #secretPin; // True Private Field
  #accessLogs = []; // Private Array

  constructor(pin) {
    this.#secretPin = pin;
  }

  #recordAccess(action) {
    this.#accessLogs.push({ action, time: Date.now() });
  }

  unlock(enteredPin) {
    this.#recordAccess("unlock_attempt");
    if (enteredPin === this.#secretPin) {
      return "ACCESS_GRANTED";
    }
    return "ACCESS_DENIED";
  }

  get logCount() {
    return this.#accessLogs.length;
  }
}

const vault = new SecureVault("9988");
assert.equal(vault.unlock("1111"), "ACCESS_DENIED");
assert.equal(vault.unlock("9988"), "ACCESS_GRANTED");
assert.equal(vault.logCount, 2);

// Kiểm tra tính bảo mật tuyệt đối của #privateField:
// 1. Không xuất hiện trong Object.keys()
assert.deepEqual(Object.keys(vault), [], "Private fields hoàn toàn vô hình trong Object.keys");
// 2. Không xuất hiện trong Reflect.ownKeys()
assert.deepEqual(Reflect.ownKeys(vault), [], "Private fields vô hình trước Reflect API");
// 3. Không thể đọc bằng chỉ mục chuỗi
assert.equal(vault["#secretPin"], undefined);
assert.equal(vault.secretPin, undefined);

// -------------------------------------------------------------
// 3. STATIC INITIALIZATION BLOCKS (static { ... } - ES2022)
// -------------------------------------------------------------
class DatabaseConnection {
  static defaultPort;
  static supportedDrivers;

  // Khối tĩnh chạy một lần duy nhất khi class được load
  static {
    this.defaultPort = 5432;
    this.supportedDrivers = Object.freeze(["postgres", "mysql", "sqlite"]);
  }

  static getDriverInfo() {
    return `Port: ${this.defaultPort}, Drivers: ${this.supportedDrivers.join(", ")}`;
  }
}

assert.equal(DatabaseConnection.defaultPort, 5432);
assert.equal(DatabaseConnection.getDriverInfo(), "Port: 5432, Drivers: postgres, mysql, sqlite");

// -------------------------------------------------------------
// 4. CLASS BẮT BUỘC PHẢI GỌI BẰNG TOÁN TỬ NEW
// -------------------------------------------------------------
// Function thông thường có thể gọi F(), nhưng Class gọi Vehicle() sẽ văng TypeError:
assert.throws(
  () => Vehicle("Toyota", 80),
  TypeError,
  "Class constructor Vehicle cannot be invoked without 'new'"
);

console.log("-> 100% tests cho Classes & Encapsulation đã pass thành công!");
