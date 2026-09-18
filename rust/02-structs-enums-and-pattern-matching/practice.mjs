// rust/02-structs-enums-and-pattern-matching/practice.mjs
import assert from "node:assert/strict";

console.log("=============================================================");
console.log("RUST SYSTEMS PROGRAMMING MODULE 02: STRUCTS & ENUMS");
console.log("=============================================================\n");

// =========================================================================
// 1. Monadic RustOption and RustResult Implementations
// =========================================================================
class RustOption {
  constructor(isSome, value) {
    this._isSome = isSome;
    this._value = value;
  }

  static Some(val) {
    if (val === undefined || val === null) {
      throw new Error("Rust Some(T) cannot encapsulate null/undefined");
    }
    return new RustOption(true, val);
  }

  static None() {
    return new RustOption(false, null);
  }

  isSome() { return this._isSome; }
  isNone() { return !this._isSome; }

  map(fn) {
    return this._isSome ? RustOption.Some(fn(this._value)) : RustOption.None();
  }

  andThen(fn) {
    return this._isSome ? fn(this._value) : RustOption.None();
  }

  unwrapOr(fallback) {
    return this._isSome ? this._value : fallback;
  }

  unwrapOrElse(fallbackFn) {
    return this._isSome ? this._value : fallbackFn();
  }

  okOr(err) {
    return this._isSome ? RustResult.Ok(this._value) : RustResult.Err(err);
  }
}

class RustResult {
  constructor(isOk, value, error) {
    this._isOk = isOk;
    this._value = value;
    this._error = error;
  }

  static Ok(val) { return new RustResult(true, val, null); }
  static Err(err) { return new RustResult(false, null, err); }

  isOk() { return this._isOk; }
  isErr() { return !this._isOk; }

  map(fn) {
    return this._isOk ? RustResult.Ok(fn(this._value)) : RustResult.Err(this._error);
  }

  mapErr(fn) {
    return this._isOk ? RustResult.Ok(this._value) : RustResult.Err(fn(this._error));
  }

  andThen(fn) {
    return this._isOk ? fn(this._value) : RustResult.Err(this._error);
  }

  unwrap() {
    if (!this._isOk) {
      throw new Error(`Called unwrap() on an Err: ${this._error}`);
    }
    return this._value;
  }
}

// [Test 1] Monadic Transformations
console.log("[Test 1] Testing Option & Result Monadic Combinator Pipelines...");
const parsePort = (rawStr) => {
  return RustOption.Some(rawStr)
    .map(s => s.trim())
    .okOr("Empty input")
    .andThen(str => {
      const num = parseInt(str, 10);
      return isNaN(num) ? RustResult.Err("Not a valid integer") : RustResult.Ok(num);
    })
    .andThen(port => {
      return (port >= 1024 && port <= 65535)
        ? RustResult.Ok(port)
        : RustResult.Err("Port must be unprivileged (1024-65535)");
    });
};

assert.equal(parsePort("  8080  ").unwrap(), 8080);
assert.equal(parsePort("80").isErr(), true);
assert.equal(parsePort("abc").isErr(), true);
console.log("  -> [PASSED] Option/Result monadic chaining short-circuits correctly.");

// =========================================================================
// 2. Exhaustive Pattern Matching Engine
// =========================================================================
console.log("\n[Test 2] Testing Exhaustive Pattern Matching with Guards & Destructuring...");

const matchHttpRequest = (req) => {
  // Simulates Rust exhaustive match compiler verification
  const knownVariants = ["GET", "POST", "DELETE"];
  if (!knownVariants.includes(req.method)) {
    throw new Error(`Non-exhaustive match: Unhandled HTTP method ${req.method}`);
  }

  if (req.method === "GET" && req.path.startsWith("/static/")) {
    return { action: "SERVE_STATIC", path: req.path };
  }
  if (req.method === "POST" && req.path === "/admin/flush") {
    if (!req.token || !req.token.startsWith("bearer-admin")) {
      return { action: "UNAUTHORIZED" };
    }
    return { action: "EXECUTE_ADMIN", path: req.path };
  }
  if (req.method === "DELETE" && req.path.startsWith("/cache/")) {
    return { action: "PURGE_CACHE", key: req.path.replace("/cache/", "") };
  }
  return { action: "NOT_FOUND" };
};

const staticRes = matchHttpRequest({ method: "GET", path: "/static/bundle.js" });
assert.equal(staticRes.action, "SERVE_STATIC");

const unauthAdmin = matchHttpRequest({ method: "POST", path: "/admin/flush", token: "bearer-user-123" });
assert.equal(unauthAdmin.action, "UNAUTHORIZED");

const authAdmin = matchHttpRequest({ method: "POST", path: "/admin/flush", token: "bearer-admin-secret" });
assert.equal(authAdmin.action, "EXECUTE_ADMIN");

assert.throws(() => {
  matchHttpRequest({ method: "PATCH", path: "/api/update" });
}, /Non-exhaustive match/);
console.log("  -> [PASSED] Exhaustive pattern matching and match guards verified.");

// =========================================================================
// 3. Type-State Machine Invariants
// =========================================================================
console.log("\n[Test 3] Testing Type-State Machine Invariants...");

class TypeStateEngine {
  constructor(state, fuel, thrust) {
    this._state = state; // "Uninitialized" | "Armed" | "Fired"
    this._fuel = fuel;
    this._thrust = thrust;
    this._consumed = false;
  }

  static new() {
    return new TypeStateEngine("Uninitialized", 100, 0);
  }

  _checkNotConsumed() {
    if (this._consumed) {
      throw new Error("Use of moved value: Type-state consumed in prior transition");
    }
  }

  arm() {
    this._checkNotConsumed();
    if (this._state !== "Uninitialized") {
      throw new Error(`Cannot arm engine from state: ${this._state}`);
    }
    if (this._fuel < 50) {
      throw new Error("Insufficient fuel");
    }
    this._consumed = true;
    return new TypeStateEngine("Armed", this._fuel, 0);
  }

  fire(thrustKn) {
    this._checkNotConsumed();
    if (this._state !== "Armed") {
      throw new Error(`Cannot fire engine from state: ${this._state}. Engine must be Armed.`);
    }
    this._consumed = true;
    return new TypeStateEngine("Fired", 0, thrustKn);
  }

  getTelemetry() {
    this._checkNotConsumed();
    if (this._state !== "Fired") {
      throw new Error("Telemetry only available after firing");
    }
    return { fuel: this._fuel, thrust: this._thrust };
  }
}

const engine = TypeStateEngine.new();
const armedEngine = engine.arm();

// Verifies original uninitialized instance is consumed:
assert.throws(() => engine.arm(), /Use of moved value/);

// Verifies illegal transition: cannot call fire on uninitialized or skip arming:
assert.throws(() => {
  const invalidEngine = TypeStateEngine.new();
  invalidEngine.fire(5000);
}, /Engine must be Armed/);

const firedEngine = armedEngine.fire(4500);
assert.throws(() => armedEngine.fire(2000), /Use of moved value/);

const telemetry = firedEngine.getTelemetry();
assert.equal(telemetry.fuel, 0);
assert.equal(telemetry.thrust, 4500);
console.log("  -> [PASSED] Type-State transitions strictly enforce valid lifecycle states.");

// =========================================================================
// 4. Memory Sizing & Null Pointer Optimization (NPO)
// =========================================================================
console.log("\n[Test 4] Testing Null Pointer Optimization (NPO) Memory Layout...");

const calculateLayout = (typeDef) => {
  if (typeDef.kind === "primitive") {
    return { size: typeDef.size, align: typeDef.size };
  }
  if (typeDef.kind === "pointer") {
    return { size: 8, align: 8 }; // 64-bit architecture
  }
  if (typeDef.kind === "enum_standard") {
    // Discriminant (1 byte) + max payload size + padding to alignment
    const maxPayload = Math.max(...typeDef.variants.map(v => v.size));
    const maxAlign = Math.max(1, ...typeDef.variants.map(v => v.align));
    const rawSize = 1 + maxPayload;
    const alignedSize = Math.ceil(rawSize / maxAlign) * maxAlign;
    return { size: alignedSize, align: maxAlign };
  }
  if (typeDef.kind === "option_pointer") {
    // NULL POINTER OPTIMIZATION: 0x0 is used as None discriminant!
    return { size: 8, align: 8, npoOptimized: true };
  }
};

const standardEnumLayout = calculateLayout({
  kind: "enum_standard",
  variants: [
    { name: "A", size: 4, align: 4 },
    { name: "B", size: 8, align: 8 }
  ]
});

const npoLayout = calculateLayout({
  kind: "option_pointer",
  inner: { kind: "pointer" }
});

// Standard enum requires discriminant + payload + align padding = 16 bytes:
assert.equal(standardEnumLayout.size, 16);
// NPO Option<&T> requires exactly 8 bytes (0 byte discriminant overhead):
assert.equal(npoLayout.size, 8);
assert.equal(npoLayout.npoOptimized, true);
console.log(`  -> Standard Enum Size: ${standardEnumLayout.size} bytes vs NPO Option<&T>: ${npoLayout.size} bytes.`);
console.log("  -> [PASSED] Null Pointer Optimization layout simulation verified.");

// =========================================================================
// 5. Method Self-Borrowing vs Value Consumption Invariants
// =========================================================================
console.log("\n[Test 5] Testing Struct Method Self-Borrowing vs Value Consumption...");

class MemoryPoolHandle {
  constructor(id, capacity) {
    this.id = id;
    this.capacity = capacity;
    this.allocated = 0;
    this.isDropped = false;
  }

  // &self: Borrow immutable
  inspect() {
    if (this.isDropped) throw new Error("Borrow of dropped object");
    return { id: this.id, available: this.capacity - this.allocated };
  }

  // &mut self: Borrow mutable
  allocate(bytes) {
    if (this.isDropped) throw new Error("Borrow of dropped object");
    if (this.allocated + bytes > this.capacity) throw new Error("OOM");
    this.allocated += bytes;
    return this.allocated;
  }

  // self: Consumes ownership
  destroy(poolRegistry) {
    if (this.isDropped) throw new Error("Use of already dropped value");
    this.isDropped = true;
    poolRegistry.deregister(this.id);
    return this.capacity; // Caller gets capacity metric back, pool object is dead
  }
}

const registry = {
  activePools: new Set(["pool-1"]),
  deregister(id) { this.activePools.delete(id); }
};

const pool = new MemoryPoolHandle("pool-1", 1024);
assert.equal(pool.inspect().available, 1024); // &self
pool.allocate(256);                           // &mut self
assert.equal(pool.inspect().available, 768);

// Destroy consumes self:
const reclaimed = pool.destroy(registry);     // self
assert.equal(reclaimed, 1024);
assert.equal(registry.activePools.has("pool-1"), false);

// Access after self consumption must fail:
assert.throws(() => pool.inspect(), /Borrow of dropped object/);
assert.throws(() => pool.allocate(100), /Borrow of dropped object/);
assert.throws(() => pool.destroy(registry), /Use of already dropped value/);
console.log("  -> [PASSED] Method self-consumption and borrowing semantics verified.");

console.log("\n=============================================================");
console.log("ALL 5 RUST SYSTEMS MODULE 02 TESTS PASSED SUCCESSFULLY! (5/5)");
console.log("=============================================================");
