# Standard Library Traits: Contracts of the Rust Ecosystem

## 1. Value Semantics: `Copy`, `Clone`, and `Drop`

### `Copy` (Implicit Bitwise Copy)
- Available only for types where all fields reside entirely on the stack and implement `Copy`.
- Triggered automatically by the compiler on assignment or parameter passing.
- **Rule**: A type cannot implement both `Copy` and `Drop`.

### `Clone` (Explicit Duplication)
- For types that manage heap memory, file descriptors, or external state.
- Explicitly requested via `.clone()`.

### `Drop` (Deterministic Destructor)
- Invoked automatically when a value falls out of scope.
- Cannot be called manually (use `std::mem::drop(val)` to force early drop).

---

## 2. Smart Pointer Dereferencing: `Deref` & Deref Coercion

The `Deref` trait allows custom smart pointers to behave like regular references:

```rust
use std::ops::Deref;

pub struct SmartBuffer<T> {
    data: Vec<T>,
}

impl<T> Deref for SmartBuffer<T> {
    type Target = [T]; // Slices

    fn deref(&self) -> &Self::Target {
        &self.data
    }
}
```

### Deref Coercion
Rust automatically converts a reference to a type that implements `Deref` into a reference to its dereference target:
- `&String` automatically coerces to `&str`
- `&Vec<T>` automatically coerces to `&[T]`
- `&Box<MyStruct>` automatically coerces to `&MyStruct`

This allows function APIs to accept `&str` and `&[T]`, maximizing compatibility with zero allocation.

---

## 3. Conversions: `From`, `Into`, `TryFrom`, and `TryInto`

### `From` & `Into` (Infallible Conversions)
Rust provides a standard reflexive guarantee:
> **Implementing `From<T> for U` automatically provides `Into<U> for T` for free!**

```rust
pub struct ConfigError {
    details: String,
}

impl From<std::io::Error> for ConfigError {
    fn from(err: std::io::Error) -> Self {
        Self { details: format!("IO failure: {}", err) }
    }
}

// Allows the `?` operator to automatically convert errors!
fn read_config() -> Result<String, ConfigError> {
    let content = std::fs::read_to_string("config.toml")?; // Converted via From
    Ok(content)
}
```

### `TryFrom` & `TryInto` (Fallible Conversions)
Used when a conversion can fail (e.g. parsing, bounds validation):
```rust
use std::convert::TryFrom;

struct NonZeroPort(u16);

impl TryFrom<u16> for NonZeroPort {
    type Error = &'static str;

    fn try_from(port: u16) -> Result<Self, Self::Error> {
        if port == 0 {
            Err("Port cannot be 0")
        } else {
            Ok(NonZeroPort(port))
        }
    }
}
```

---

## 4. Iteration: `Iterator` and Lazy Evaluation

Rust iterators are **zero-cost abstractions**. They produce no machine code overhead compared to manual C-style indexing loops:

```rust
pub struct Fibonacci {
    curr: u64,
    next: u64,
}

impl Fibonacci {
    pub fn new() -> Self {
        Self { curr: 0, next: 1 }
    }
}

impl Iterator for Fibonacci {
    type Item = u64;

    fn next(&mut self) -> Option<Self::Item> {
        let new_next = self.curr + self.next;
        self.curr = self.next;
        self.next = new_next;
        Some(self.curr)
    }
}
```

Iterators are **lazy**: transformations (`.map()`, `.filter()`) do not execute until consumed by a terminal consumer (`.collect()`, `.sum()`, `.for_each()`):

```rust
let sum: u64 = Fibonacci::new()
    .take(10)
    .filter(|&n| n % 2 == 0)
    .sum();
```
