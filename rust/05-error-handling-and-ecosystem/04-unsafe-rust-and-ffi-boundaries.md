# Unsafe Rust, Raw Pointers, and FFI Boundaries

## 1. Why Does Unsafe Rust Exist?

Computer hardware is inherently unsafe: CPU registers, memory-mapped I/O, OS syscalls, and low-level C libraries do not conform to Rust's type-checker rules.

`unsafe` does **not** disable the borrow checker or type system! It grants access to **exactly five "superpowers"** that the compiler cannot verify mathematically:

1. **Dereference raw pointers**.
2. **Call an unsafe function or method** (including Foreign Function Interface functions).
3. **Implement an unsafe trait** (e.g. `unsafe impl Send for MyRawPointerWrapper`).
4. **Mutate a mutable static variable**.
5. **Access fields of a `union`**.

---

## 2. Raw Pointers (`*const T` and `*mut T`)

Unlike references (`&T` and `&mut T`), raw pointers:
- Are allowed to ignore borrowing rules (multiple mutable pointers to the same memory are legal).
- Are not guaranteed to point to valid memory (can be `null` or dangling).
- Do not have automatic cleanup (no RAII drops).

```rust
let mut num = 42;

// Creating raw pointers is completely SAFE:
let r1: *const i32 = &num;
let r2: *mut i32 = &mut num;

// Dereferencing raw pointers requires UNSAFE block:
unsafe {
    println!("r1 points to: {}", *r1);
    *r2 = 1337;
    println!("r2 updated value to: {}", *r2);
}
```

---

## 3. Foreign Function Interface (FFI) & C-ABI Interoperability

To interface with existing C/C++ libraries (or export Rust libraries to Python, Node.js, or C):

### 3.1 Calling C Functions from Rust
```rust
use std::os::raw::{c_char, c_int};

// Declare foreign C signatures:
extern "C" {
    fn abs(input: c_int) -> c_int;
    fn puts(s: *const c_char) -> c_int;
}

fn call_c_abs() {
    let result = unsafe { abs(-42) };
    println!("C abs output: {}", result); // 42
}
```

### 3.2 Exporting Rust Functions to C
```rust
// #[no_mangle] prevents the Rust compiler from mangling the symbol name in the object file:
#[no_mangle]
pub extern "C" fn calculate_sha256_checksum(
    input_ptr: *const u8,
    len: usize,
    output_buffer: *mut u8,
) -> i32 {
    if input_ptr.is_null() || output_buffer.is_null() {
        return -1; // Null pointer check
    }

    // Wrap raw C pointer in a safe Rust slice:
    let slice = unsafe { std::slice::from_raw_parts(input_ptr, len) };

    // Compute checksum safely...
    0 // Success
}
```

---

## 4. Undefined Behavior (UB) & Verification with Miri

In safe Rust, Undefined Behavior is mathematically impossible. Inside `unsafe` blocks, developers assume total responsibility.

### Common Sources of Undefined Behavior:
1. **Deref of Null or Dangling Pointers**.
2. **Unaligned Memory Access**: Reading a `u64` from an odd byte address on architectures that forbid unaligned access.
3. **Aliasing Violations**: Creating a safe mutable reference `&mut T` to memory that has another active reference.
4. **Reading Uninitialized Memory**: Treating raw uninitialized stack bytes as valid types.

### The Ultimate Unsafe Safety Net: Miri
**Miri** is an official interpreter that executes Rust code directly on its Mid-level Intermediate Representation (MIR). It tracks memory allocations and detects any undefined behavior:

```bash
# Install and run Miri:
rustup component add miri
cargo miri test
```
If your unsafe code violates pointer provenance, aliasing rules, or leaks memory, Miri produces an immediate deterministic error report pinpointing the exact offending line.
