# Generics, Trait Bounds, and Monomorphization

## 1. Generics: Zero-Cost Polymorphism

Generics allow functions, structs, and enums to operate over multiple concrete types without duplicating code:

```rust
pub struct Point<T> {
    pub x: T,
    pub y: T,
}

impl<T> Point<T> {
    pub fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

// Specialized implementation ONLY for f64:
impl Point<f64> {
    pub fn distance_from_origin(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

---

## 2. Trait Bounds & `where` Clauses

Without bounds, generic `T` can only be moved, dropped, and stored—you cannot print it, compare it, or perform arithmetic on it. Trait bounds specify required capabilities:

### 2.1 Inline Bounds
```rust
use std::fmt::Display;

pub fn print_max<T: PartialOrd + Display>(a: T, b: T) {
    if a >= b {
        println!("Max: {}", a);
    } else {
        println!("Max: {}", b);
    }
}
```

### 2.2 `where` Clauses
When bounds become complex, `where` clauses keep function signatures clean and readable:

```rust
pub fn serialize_and_transmit<T, U>(payload: T, destination: U) -> Result<(), String>
where
    T: serde::Serialize + std::fmt::Debug + Send + 'static,
    U: std::net::ToSocketAddrs + std::fmt::Display,
{
    println!("Transmitting {:?} to {}", payload, destination);
    Ok(())
}
```

---

## 3. The Mechanics of Monomorphization

In languages like Java, generics use **type erasure** (`List<Object>`), where primitive types are boxed into heap pointers and method calls are dispatched via virtual method tables at runtime.

In Rust, generics use **monomorphization**:
1. The compiler inspects every call site of a generic function.
2. It generates a **distinct, concrete machine code version** for each concrete type encountered.

```rust
fn print_val<T: std::fmt::Debug>(val: T) {
    println!("{:?}", val);
}

fn main() {
    print_val(42i32);
    print_val("hello");
}
```

### What the compiler produces behind the scenes:
```rust
// Generated exclusively for i32:
fn print_val_i32(val: i32) {
    // Direct inlined code, no pointers or boxing
}

// Generated exclusively for &str:
fn print_val_str(val: &str) {
    // Direct inlined code
}
```

### Monomorphization Trade-Offs:

| Dimension | Monomorphization (Rust) | Type Erasure (Java / Go interfaces) |
|---|---|---|
| **Runtime Performance** | **Maximum**: Exact type known, LLVM inlines instructions, zero indirection | Slower: Heap boxing, pointer dereferencing, cache misses |
| **Binary Size** | Potential **Code Bloat**: Duplicated machine code for each unique type | Compact: Single bytecode/binary implementation |
| **Compile Time** | Slower: LLVM must optimize and compile every concrete monomorphized variant | Fast: Only one implementation compiled once |
