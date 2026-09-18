// Rust Systems Programming - Module 01 Practice Verification Suite
import assert from 'node:assert/strict';

console.log('=============================================================');
console.log('RUST SYSTEMS PROGRAMMING MODULE 01: OWNERSHIP & BORROWING');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Rust Move Semantics vs Copy Types Invariant Simulation
// ======================================================================
console.log('[Test 1] Testing Move Semantics vs Copy Types Invariants...');

class RustVariableTracker {
  constructor() {
    this.variables = new Map(); // name -> { type, isCopy, isValid }
  }

  declare(name, type, isCopy) {
    this.variables.set(name, { type, isCopy, isValid: true });
  }

  assign(target, source) {
    const src = this.variables.get(source);
    if (!src) throw new Error(`UndeclaredVariable: ${source}`);
    if (!src.isValid) throw new Error(`BorrowOfMovedValueError: Use of moved value \`${source}\``);

    if (src.isCopy) {
      // Copy trait: source remains valid
      this.variables.set(target, { ...src });
    } else {
      // Move semantics: ownership transferred, source invalidated
      this.variables.set(target, { ...src, isValid: true });
      src.isValid = false; // Invalidated at compile-time!
    }
  }

  read(name) {
    const v = this.variables.get(name);
    if (!v || !v.isValid) throw new Error(`BorrowOfMovedValueError: Use of moved value \`${name}\``);
    return true;
  }
}

const tracker = new RustVariableTracker();

// 1. Primitive i32 has Copy trait
tracker.declare('num_a', 'i32', true);
tracker.assign('num_b', 'num_a');
assert.strictEqual(tracker.read('num_a'), true, 'Copy type must remain readable after assignment');
assert.strictEqual(tracker.read('num_b'), true, 'Copied variable must be readable');

// 2. String has Move semantics
tracker.declare('str_s1', 'String', false);
tracker.assign('str_s2', 'str_s1');
assert.strictEqual(tracker.read('str_s2'), true, 'Destination of move must be valid');

assert.throws(
  () => tracker.read('str_s1'),
  /BorrowOfMovedValueError/,
  'Source of moved value must be invalidated at compile time'
);

console.log('  -> [PASSED] Move semantics and Copy trait rules enforced with zero ambiguity.\n');

// ======================================================================
// Challenge 2: Aliasing XOR Mutability Borrow Checker Simulator
// ======================================================================
console.log('[Test 2] Testing Aliasing XOR Mutability Borrow Checker Invariants...');

class BorrowCheckerSimulator {
  constructor() {
    this.sharedBorrows = 0;
    this.hasMutableBorrow = false;
  }

  borrowShared() {
    if (this.hasMutableBorrow) {
      throw new Error('BorrowSharedWhileMutError: Cannot borrow as immutable because it is also borrowed as mutable');
    }
    this.sharedBorrows += 1;
  }

  releaseShared() {
    if (this.sharedBorrows > 0) this.sharedBorrows -= 1;
  }

  borrowMutable() {
    if (this.hasMutableBorrow) {
      throw new Error('BorrowMutConflictError: Cannot borrow as mutable more than once at a time');
    }
    if (this.sharedBorrows > 0) {
      throw new Error('BorrowMutWhileSharedError: Cannot borrow as mutable while active immutable borrows exist');
    }
    this.hasMutableBorrow = true;
  }

  releaseMutable() {
    this.hasMutableBorrow = false;
  }
}

const bc = new BorrowCheckerSimulator();

// Multiple shared borrows allowed
bc.borrowShared();
bc.borrowShared();
assert.strictEqual(bc.sharedBorrows, 2);

// Cannot borrow mutable while shared active
assert.throws(
  () => bc.borrowMutable(),
  /BorrowMutWhileSharedError/,
  'Must reject mutable borrow while shared borrows exist'
);

// Release all shared borrows
bc.releaseShared();
bc.releaseShared();
assert.strictEqual(bc.sharedBorrows, 0);

// Now mutable borrow succeeds
bc.borrowMutable();
assert.strictEqual(bc.hasMutableBorrow, true);

// Cannot borrow second mutable or shared while mutable active
assert.throws(
  () => bc.borrowMutable(),
  /BorrowMutConflictError/,
  'Cannot acquire multiple mutable references'
);
assert.throws(
  () => bc.borrowShared(),
  /BorrowSharedWhileMutError/,
  'Cannot acquire immutable reference while mutable reference exists'
);

bc.releaseMutable();
console.log('  -> [PASSED] Aliasing XOR Mutability invariant strictly prevents Data Races.\n');

// ======================================================================
// Challenge 3: Dangling Reference Lifetime Scope Bounds
// ======================================================================
console.log('[Test 3] Testing Dangling Reference Lifetime Scope Bounds...');

function checkLifetimeScope(referenceLife, ownerLife) {
  // A reference is only safe if its lifetime is within the bounds of the owner
  if (referenceLife.start < ownerLife.start || referenceLife.end > ownerLife.end) {
    throw new Error('DoesNotLiveLongEnoughError: Borrowed value does not live long enough');
  }
  return true;
}

const outerScope = { start: 1, end: 10 };
const innerScope = { start: 4, end: 7 };

// Reference confined to inner scope pointing to inner owner is valid
assert.strictEqual(checkLifetimeScope({ start: 4, end: 6 }, innerScope), true);

// Dangling Reference: Reference lives across outer scope [1, 10] while owner dies at [7]
assert.throws(
  () => checkLifetimeScope(outerScope, innerScope),
  /DoesNotLiveLongEnoughError/,
  'Borrow checker must reject references that outlive the owner'
);

console.log('  -> [PASSED] Lifetime analysis prevents Dangling References and Use-After-Free.\n');

// ======================================================================
// Challenge 4: UTF-8 String Slice (&str) Boundary Verification
// ======================================================================
console.log('[Test 4] Testing UTF-8 String Slice (&str) Boundary Invariants...');

function sliceUtf8String(str, byteStart, byteEnd) {
  const buf = Buffer.from(str, 'utf8');

  if (byteStart < 0 || byteEnd > buf.length || byteStart > byteEnd) {
    throw new Error('IndexOutOfBoundsException');
  }

  // Verify byteStart and byteEnd are valid UTF-8 character boundaries
  // In UTF-8, continuation bytes match 10xxxxxx in binary (0x80 to 0xBF)
  const isContinuationByte = (b) => (b & 0xc0) === 0x80;

  if (byteStart < buf.length && isContinuationByte(buf[byteStart])) {
    throw new Error(`SliceBoundaryError: byte index ${byteStart} is not a valid char boundary`);
  }
  if (byteEnd < buf.length && isContinuationByte(buf[byteEnd])) {
    throw new Error(`SliceBoundaryError: byte index ${byteEnd} is not a valid char boundary`);
  }

  return buf.subarray(byteStart, byteEnd).toString('utf8');
}

const rustText = 'Rust 🦀 Systems';
// Byte layout: 'Rust ' (5 bytes: 0-4), '🦀' (4 bytes: 5-8), ' Systems' (8 bytes: 9-16)

assert.strictEqual(sliceUtf8String(rustText, 0, 4), 'Rust');
assert.strictEqual(sliceUtf8String(rustText, 5, 9), '🦀');

// Slicing inside the 4-byte emoji (e.g. index 6 or 7) must panic/throw
assert.throws(
  () => sliceUtf8String(rustText, 5, 7),
  /SliceBoundaryError/,
  'Rust string slicing must forbid slicing across multibyte UTF-8 codepoints'
);

console.log('  -> [PASSED] UTF-8 slice boundaries protect string encoding integrity.\n');

// ======================================================================
// Challenge 5: RAII Scope Drop Order Invariant
// ======================================================================
console.log('[Test 5] Testing RAII Scope Drop Order Invariant (Reverse Declaration)...');

class RaiiScopeManager {
  constructor() {
    this.declaredStack = [];
    this.dropLog = [];
  }

  declare(name) {
    this.declaredStack.push(name);
  }

  exitScope() {
    // In Rust, variables in a scope are dropped in REVERSE order of declaration
    while (this.declaredStack.length > 0) {
      const dropped = this.declaredStack.pop();
      this.dropLog.push(`drop(${dropped})`);
    }
  }
}

const raii = new RaiiScopeManager();
raii.declare('resource_A_file_handle');
raii.declare('resource_B_socket_conn');
raii.declare('resource_C_mutex_lock');

raii.exitScope();

console.log('  -> Scope exit drop sequence:', raii.dropLog);

assert.deepStrictEqual(
  raii.dropLog,
  ['drop(resource_C_mutex_lock)', 'drop(resource_B_socket_conn)', 'drop(resource_A_file_handle)'],
  'Rust variables must drop in strictly reverse declaration order (LIFO)'
);

console.log('  -> [PASSED] RAII LIFO destruction order guarantees safe dependency unwinding.\n');

console.log('=============================================================');
console.log('ALL 5 RUST SYSTEMS MODULE 01 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
