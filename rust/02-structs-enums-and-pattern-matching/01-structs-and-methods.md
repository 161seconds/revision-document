# Structs, Memory Layout, and Methods in Rust

## 1. Product Types: Struct Variations

In Rust, structs allow you to compose heterogeneous data types together. They are **product types** because the set of possible values is the Cartesian product of the types of its fields.

### 1.1 Classic Named-Field Structs
Fields have explicit names and types. By default, fields are private to the declaring module:
```rust
pub struct TcpConnection {
    pub host: String,
    pub port: u16,
    active: bool, // Private field
}
```

### 1.2 Tuple Structs
Fields are anonymous and indexed numerically (`.0`, `.1`). Often used for the **Newtype Pattern** to enforce type safety without runtime overhead:
```rust
pub struct Milliseconds(pub u64);
pub struct Bytes(pub usize);

// Prevents accidental unit mismatch at compile time:
fn allocate_buffer(size: Bytes, timeout: Milliseconds) {
    // ...
}
```

### 1.3 Unit-Like Structs
Structs without fields (`struct Sentinel;`). They occupy **0 bytes** of memory (Zero-Sized Types, or ZSTs). Extremely useful for marker types, state transitions, and trait implementations:
```rust
pub struct Unauthenticated;
pub struct Authenticated;
```

---

## 2. Memory Layout and Padding Optimization

By default, Rust uses the `repr(Rust)` representation. The compiler is free to reorder fields to minimize padding caused by hardware memory alignment:

```rust
// In C, this struct would consume 16 bytes due to padding between u8 and u64:
// u8 (1 byte) + 7 padding bytes + u64 (8 bytes) + u16 (2 bytes) + 6 padding bytes = 24 bytes!
struct Unoptimized {
    a: u8,
    b: u64,
    c: u16,
}

// In Rust (repr(Rust)), the compiler reorders fields in memory to:
// b (8 bytes) + c (2 bytes) + a (1 byte) + 5 padding bytes = 16 bytes.
```

If exact C-compatible ABI layout is required (e.g., FFI, network packet serialization, hardware registers):
```rust
#[repr(C)]
pub struct PacketHeader {
    pub version: u8,
    pub flags: u8,
    pub payload_len: u16,
    pub sequence_id: u32,
}
```

---

## 3. Methods vs Associated Functions

Methods are defined inside `impl` blocks:

```rust
pub struct MemoryPool {
    capacity_bytes: usize,
    allocated_bytes: usize,
}

impl MemoryPool {
    // Associated function (Constructor): No `self` parameter
    pub fn new(capacity_bytes: usize) -> Self {
        Self {
            capacity_bytes,
            allocated_bytes: 0,
        }
    }

    // Immutable borrow (&self): Reads state without modifying or moving
    pub fn available_bytes(&self) -> usize {
        self.capacity_bytes - self.allocated_bytes
    }

    // Mutable borrow (&mut self): Modifies state in-place
    pub fn allocate(&mut self, bytes: usize) -> Result<usize, &'static str> {
        if self.allocated_bytes + bytes > self.capacity_bytes {
            return Err("Out of memory");
        }
        let offset = self.allocated_bytes;
        self.allocated_bytes += bytes;
        Ok(offset)
    }

    // Consuming method (self): Takes ownership, destroying or transforming the object
    pub fn drain_and_decommission(self) -> usize {
        println!("Decommissioning pool with capacity {}", self.capacity_bytes);
        self.allocated_bytes
        // `self` is dropped here; caller can no longer access the MemoryPool!
    }
}
```

### Self Parameter Invariant Matrix:

| Self Signature | Semantics | Caller Impact | Common Use Case |
|---|---|---|---|
| `&self` | Shared / Immutable Reference | Caller retains ownership; multiple callers can read concurrently | Getters, inspection, serialization |
| `&mut self` | Exclusive / Mutable Reference | Caller retains ownership; exclusive lock on object | Mutation, state transition in-place |
| `self` | Owned Value (Move) | Object moved out of caller; caller can never use it again | Type-state transitions, builders (`.build()`), teardown |
