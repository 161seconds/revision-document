// rust/05-error-handling-and-ecosystem/practice.mjs
import assert from "node:assert/strict";

console.log("=============================================================");
console.log("RUST SYSTEMS PROGRAMMING MODULE 05: ERRORS & ECOSYSTEM");
console.log("=============================================================\n");

// =========================================================================
// 1. Question Mark Operator `?` and Error Transformation Pipeline
// =========================================================================
console.log("[Test 1] Testing Question Mark `?` Operator Error Propagation...");

class RustErrorSystem {
  constructor() {
    this.conversions = new Map();
  }

  registerFrom(targetError, sourceError, converterFn) {
    this.conversions.set(`${sourceError}->${targetError}`, converterFn);
  }

  // Simulates `?` operator on a Result<T, E>
  tryUnwrap(result, enclosingTargetError) {
    if (result.ok) {
      return result.value;
    }

    const sourceError = result.error.type;
    const key = `${sourceError}->${enclosingTargetError}`;
    const converter = this.conversions.get(key);

    if (!converter) {
      throw new Error(`Compile Error: The trait bound '${enclosingTargetError}: From<${sourceError}>' is not satisfied`);
    }

    // Early return with converted error:
    const converted = converter(result.error);
    const earlyReturnErr = new Error("EARLY_RETURN_ERR");
    earlyReturnErr.propagatedError = converted;
    throw earlyReturnErr;
  }
}

const errSys = new RustErrorSystem();
errSys.registerFrom("AppError", "IoError", (e) => ({
  type: "AppError",
  code: 500,
  details: `File IO failed: ${e.message}`
}));
errSys.registerFrom("AppError", "ParseIntError", (e) => ({
  type: "AppError",
  code: 400,
  details: `Invalid integer format: ${e.message}`
}));

const loadConfigPipeline = (ioFails, parseFails) => {
  try {
    const ioRes = ioFails
      ? { ok: false, error: { type: "IoError", message: "File not found /etc/app.conf" } }
      : { ok: true, value: "8080" };
    const rawPortStr = errSys.tryUnwrap(ioRes, "AppError");

    const parseRes = parseFails
      ? { ok: false, error: { type: "ParseIntError", message: "invalid digit found in string" } }
      : { ok: true, value: parseInt(rawPortStr, 10) };
    const port = errSys.tryUnwrap(parseRes, "AppError");

    return { ok: true, port };
  } catch (err) {
    if (err.message === "EARLY_RETURN_ERR") {
      return { ok: false, error: err.propagatedError };
    }
    throw err;
  }
};

const okRes = loadConfigPipeline(false, false);
assert.equal(okRes.ok, true);
assert.equal(okRes.port, 8080);

const ioErrRes = loadConfigPipeline(true, false);
assert.equal(ioErrRes.ok, false);
assert.equal(ioErrRes.error.code, 500);

const parseErrRes = loadConfigPipeline(false, true);
assert.equal(parseErrRes.ok, false);
assert.equal(parseErrRes.error.code, 400);
console.log("  -> [PASSED] `?` operator early return and From error transformation verified.");

// =========================================================================
// 2. Recursive Binary Search Tree with Box<T> Indirection
// =========================================================================
console.log("\n[Test 2] Testing Recursive Binary Search Tree via Box<T>...");

class BoxedTreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;  // Option<Box<TreeNode<T>>>
    this.right = null; // Option<Box<TreeNode<T>>>
  }

  insert(newVal) {
    if (newVal < this.val) {
      if (this.left) {
        this.left.insert(newVal);
      } else {
        this.left = new BoxedTreeNode(newVal);
      }
    } else if (newVal > this.val) {
      if (this.right) {
        this.right.insert(newVal);
      } else {
        this.right = new BoxedTreeNode(newVal);
      }
    }
  }

  inOrderTraversal(acc = []) {
    if (this.left) this.left.inOrderTraversal(acc);
    acc.push(this.val);
    if (this.right) this.right.inOrderTraversal(acc);
    return acc;
  }

  contains(target) {
    if (target === this.val) return true;
    if (target < this.val) return this.left ? this.left.contains(target) : false;
    return this.right ? this.right.contains(target) : false;
  }
}

const bst = new BoxedTreeNode(50);
[30, 70, 20, 40, 60, 80].forEach(v => bst.insert(v));

assert.deepEqual(bst.inOrderTraversal(), [20, 30, 40, 50, 60, 70, 80]);
assert.equal(bst.contains(40), true);
assert.equal(bst.contains(99), false);
console.log("  -> [PASSED] Boxed recursive data structures and traversals verified.");

// =========================================================================
// 3. RefCell<T> Runtime Dynamic Borrow Checker
// =========================================================================
console.log("\n[Test 3] Testing RefCell<T> Runtime Dynamic Borrow Checker...");

class RefCell {
  constructor(val) {
    this._value = val;
    this._borrowCount = 0; // > 0: readers, 0: free, -1: exclusive writer
  }

  borrow() {
    if (this._borrowCount < 0) {
      throw new Error("BorrowError: Already mutably borrowed");
    }
    this._borrowCount++;
    let active = true;
    return {
      get: () => {
        if (!active) throw new Error("Use of dropped Ref guard");
        return this._value;
      },
      drop: () => {
        if (active) {
          active = false;
          this._borrowCount--;
        }
      }
    };
  }

  borrowMut() {
    if (this._borrowCount !== 0) {
      throw new Error(`BorrowMutError: Already borrowed (active count: ${this._borrowCount})`);
    }
    this._borrowCount = -1;
    let active = true;
    return {
      get: () => {
        if (!active) throw new Error("Use of dropped RefMut guard");
        return this._value;
      },
      set: (newVal) => {
        if (!active) throw new Error("Use of dropped RefMut guard");
        this._value = newVal;
      },
      drop: () => {
        if (active) {
          active = false;
          this._borrowCount = 0;
        }
      }
    };
  }
}

const cell = new RefCell({ score: 100 });

// Multiple readers allowed concurrently:
const r1 = cell.borrow();
const r2 = cell.borrow();
assert.equal(r1.get().score, 100);
assert.equal(r2.get().score, 100);

// Attempting to borrow_mut while readers exist must panic:
assert.throws(() => cell.borrowMut(), /BorrowMutError: Already borrowed/);

// Drop readers:
r1.drop();
r2.drop();

// Now exclusive mutable borrow succeeds:
const w1 = cell.borrowMut();
w1.set({ score: 250 });

// Second borrow or borrow_mut while writer is active must panic:
assert.throws(() => cell.borrow(), /BorrowError: Already mutably borrowed/);
assert.throws(() => cell.borrowMut(), /BorrowMutError: Already borrowed/);

w1.drop();
assert.equal(cell.borrow().get().score, 250);
console.log("  -> [PASSED] RefCell dynamic runtime borrow checker strictly verified.");

// =========================================================================
// 4. Cow (Clone-On-Write) Zero-Allocation String Sanitizer
// =========================================================================
console.log("\n[Test 4] Testing Cow (Clone-On-Write) Zero-Allocation Invariants...");

class CowString {
  constructor(kind, value) {
    this.kind = kind; // "Borrowed" | "Owned"
    this.value = value;
  }

  static Borrowed(sliceRef) {
    return new CowString("Borrowed", sliceRef);
  }

  static Owned(allocatedString) {
    return new CowString("Owned", allocatedString);
  }

  isBorrowed() { return this.kind === "Borrowed"; }
  isOwned() { return this.kind === "Owned"; }
}

const sanitizeHttpHeader = (inputStr) => {
  // If string contains CRLF injection, mutate and allocate Cow::Owned
  if (inputStr.includes("\r") || inputStr.includes("\n")) {
    const cleaned = inputStr.replace(/[\r\n]/g, "");
    return CowString.Owned(cleaned);
  }
  // Otherwise, return zero-allocation Cow::Borrowed pointing to original reference!
  return CowString.Borrowed(inputStr);
};

const cleanHeader = "Content-Type: application/json; charset=utf-8";
const cow1 = sanitizeHttpHeader(cleanHeader);
assert.equal(cow1.isBorrowed(), true);
assert.equal(cow1.value, cleanHeader);

const dirtyHeader = "Set-Cookie: auth=evil\r\nInjected-Header: 1337";
const cow2 = sanitizeHttpHeader(dirtyHeader);
assert.equal(cow2.isOwned(), true);
assert.equal(cow2.value, "Set-Cookie: auth=evilInjected-Header: 1337");

console.log("  -> Clean input zero-allocation borrowed: " + cow1.isBorrowed());
console.log("  -> Dirty input cloned on write owned: " + cow2.isOwned());
console.log("  -> [PASSED] Cow Clone-On-Write optimization semantics verified.");

// =========================================================================
// 5. Unsafe Pointer Alignment & Boundary Verifier
// =========================================================================
console.log("\n[Test 5] Testing Unsafe Pointer Alignment & Boundary Invariants...");

class SimulatedMemoryArena {
  constructor(sizeBytes) {
    this.buffer = new Uint8Array(sizeBytes);
  }

  // Simulates dereferencing raw pointer `*const u32`
  readU32(byteOffset) {
    if (byteOffset === 0) {
      throw new Error("UndefinedBehavior: Dereference of null pointer (0x0)");
    }
    // u32 requires 4-byte hardware alignment!
    if (byteOffset % 4 !== 0) {
      throw new Error(`UndefinedBehavior: Unaligned pointer read at address 0x${byteOffset.toString(16)} (must be 4-byte aligned)`);
    }
    if (byteOffset + 4 > this.buffer.length) {
      throw new Error("UndefinedBehavior: Out of bounds memory access");
    }

    const view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    return view.getUint32(byteOffset, true); // Little endian
  }

  writeU32(byteOffset, value) {
    if (byteOffset === 0) {
      throw new Error("UndefinedBehavior: Dereference of null pointer (0x0)");
    }
    if (byteOffset % 4 !== 0) {
      throw new Error(`UndefinedBehavior: Unaligned pointer write at address 0x${byteOffset.toString(16)}`);
    }
    const view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    view.setUint32(byteOffset, value, true);
  }
}

const arena = new SimulatedMemoryArena(64);

// Write and read from aligned address (0x04)
arena.writeU32(4, 0x12345678);
assert.equal(arena.readU32(4), 0x12345678);

// Null pointer access triggers UB error:
assert.throws(() => arena.readU32(0), /Dereference of null pointer/);

// Unaligned access (offset 3 is not divisible by 4) triggers UB error:
assert.throws(() => arena.readU32(3), /Unaligned pointer read/);
assert.throws(() => arena.writeU32(5, 42), /Unaligned pointer write/);

// Out of bounds access triggers UB error:
assert.throws(() => arena.readU32(64), /Out of bounds memory access/);

console.log("  -> [PASSED] Unsafe pointer null, alignment, and bounds checking strictly verified.");

console.log("\n=============================================================");
console.log("ALL 5 RUST SYSTEMS MODULE 05 TESTS PASSED SUCCESSFULLY! (5/5)");
console.log("=============================================================");
