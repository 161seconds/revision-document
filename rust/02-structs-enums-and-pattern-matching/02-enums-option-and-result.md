# Enums, Tagged Unions, Option, and Result

## 1. Sum Types and Tagged Unions

While structs represent **product types** (AND logic: field A AND field B), Rust `enum` represents **sum types** (OR logic: variant A OR variant B).

Unlike C/C++ enums which are merely integer constants, Rust enums are **tagged unions**: each variant can encapsulate distinct payloads of different types and sizes.

```rust
pub enum NetworkEvent {
    Connected { peer_addr: String, timestamp: u64 }, // Struct variant
    DataReceived(Vec<u8>),                            // Tuple variant
    Heartbeat,                                        // Unit variant
    Disconnected(u32),                                // Error code variant
}
```

### Memory Layout of Enums
Under the hood, a tagged union consists of:
1. **Discriminant (Tag)**: An integer tag indicating which variant is active (e.g., 1 byte `u8`).
2. **Payload Union**: The maximum memory size required by the largest variant, with proper hardware alignment.

```
Total Enum Size = AlignUp(SizeOf(Tag) + SizeOf(Largest Variant), MaxAlignment)
```

---

## 2. Null Pointer Optimization (NPO)

In languages like Java or C++, every reference or pointer can be `null`, requiring constant runtime null checks or risking `NullPointerException` / Segfaults.

Rust **has no `null` pointers**. Instead, optionality is modeled explicitly via `Option<T>`:
```rust
pub enum Option<T> {
    Some(T),
    None,
}
```

### Zero-Cost Abstraction via NPO
Naively, `Option<T>` would require 1 byte for the discriminant (`Some` vs `None`) plus padding plus the size of `T`.
However, types like `&T`, `&mut T`, `Box<T>`, and `std::ptr::NonNull<T>` are **guaranteed never to be 0x0 (null)**.

The Rust compiler exploits this invalid bit pattern (0x0) to represent `None`!
- Size of `&String`: **8 bytes** (on 64-bit systems)
- Size of `Option<&String>`: **8 bytes**! (0x0 represents `None`, non-zero represents `Some(ptr)`)
- Zero overhead in memory layout and zero overhead when passing through CPU registers!

---

## 3. Monadic Combinators on `Option<T>` and `Result<T, E>`

Rust discourages imperative nested `if` or `match` blocks for unwrapping options and results. Instead, idiomatic code uses functional monadic transformations:

### 3.1 `Option<T>` Combinator Flow
```rust
fn get_user_avatar_url(user_id: u64) -> Option<String> {
    find_user(user_id)                         // Option<User>
        .and_then(|u| u.profile)               // FlatMap: Option<Profile>
        .map(|p| p.avatar_filename)            // Map: Option<String>
        .map(|f| format!("https://cdn.example.com/{}", f))
        .filter(|url| url.starts_with("https"))
}

// Fallback defaults:
let url = get_user_avatar_url(42)
    .unwrap_or_else(|| "https://cdn.example.com/default.png".to_string());
```

### 3.2 `Result<T, E>` Combinator Flow
`Result<T, E>` models computations that can succeed (`Ok(T)`) or fail (`Err(E)`):

```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}

fn parse_and_validate_port(input: &str) -> Result<u16, String> {
    input
        .trim()
        .parse::<u16>()                         // Result<u16, ParseIntError>
        .map_err(|e| format!("Invalid integer: {}", e))
        .and_then(|port| {
            if port > 1024 {
                Ok(port)
            } else {
                Err("Privileged port (< 1024) disallowed".to_string())
            }
        })
}
```

### Quick Combinator Cheat Sheet:

| Method | When `Some` / `Ok` | When `None` / `Err` |
|---|---|---|
| `.map(f)` | Transforms inner value with `f(val)` | Passes `None` / `Err` through unchanged |
| `.and_then(f)` | Flattens: calls `f(val)` returning another `Option`/`Result` | Short-circuits returning `None` / `Err` |
| `.map_err(f)` | Passes `Ok(val)` through unchanged | Transforms error with `f(err)` |
| `.unwrap_or(default)` | Returns inner value | Returns provided fallback default |
| `.unwrap_or_else(f)` | Returns inner value | Lazily evaluates `f()` to compute default |
| `.ok_or(err)` | Converts `Option<T>` to `Result<T, E>` (`Some(v)` -> `Ok(v)`) | Converts `None` -> `Err(err)` |
