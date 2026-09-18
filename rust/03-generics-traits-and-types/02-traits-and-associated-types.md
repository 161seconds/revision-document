# Traits, Associated Types, and the Orphan Rule

## 1. Defining and Implementing Traits

A `trait` defines a shared behavioral interface that types can implement:

```rust
pub trait Summary {
    // Required method:
    fn summarize_author(&self) -> String;

    // Default method implementation:
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }
    // Inherits default `summarize` implementation or can override it
}
```

---

## 2. Associated Types vs Generic Traits

A trait can define inner types using **Associated Types**:

```rust
pub trait Iterator {
    type Item; // Associated type

    fn next(&mut self) -> Option<Self::Item>;
}
```

### When to choose Associated Types vs Generic Type Parameters:

#### Choice A: Associated Types (1-to-1 Relationship)
Use when a struct should only ever have **one single implementation** of the trait:
```rust
// A Graph node traversal iterator only yields NodeId, never multiple conflicting types:
impl Iterator for NodeWalker {
    type Item = NodeId;
    fn next(&mut self) -> Option<Self::Item> { /* ... */ }
}
```
If `Iterator` were generic (`Iterator<T>`), a type could theoretically implement `Iterator<String>` AND `Iterator<i32>`, forcing callers to annotate types on every call site (`walker.next::<i32>()`), ruining ergonomic iterator chaining.

#### Choice B: Generic Traits (1-to-Many Relationship)
Use when a type legitimately needs **multiple implementations** for different target types:
```rust
pub trait From<T> {
    fn from(value: T) -> Self;
}

// IP address can be converted From [u8; 4] AND From &str:
impl From<[u8; 4]> for IpAddr { /* ... */ }
impl From<&str> for IpAddr { /* ... */ }
```

---

## 3. The Orphan Rule (Coherence Principle)

Rust strictly enforces the **Coherence Rule** (informally known as the **Orphan Rule**):
> You can implement a trait for a type **if and only if** either the **trait** or the **type** is declared in the local crate.

```rust
// Inside crate `my_app`:
use std::fmt::Display; // External trait from std
use std::collections::HashMap; // External type from std

// COMPILE ERROR! Both Display and HashMap are external to `my_app`:
// impl<K, V> Display for HashMap<K, V> { ... }
```

### Why does this rule exist?
If crate A implemented `Display for Vec<i32>` and crate B also implemented `Display for Vec<i32>`, linking both crates into application C would create an ambiguous conflict over which virtual table or method to call!

### The Idiomatic Workaround: The Newtype Pattern
Wrap the external type in a local tuple struct:
```rust
pub struct MyMap<K, V>(pub std::collections::HashMap<K, V>);

// Legal! `MyMap` is local to our crate:
impl<K: std::fmt::Display, V: std::fmt::Display> std::fmt::Display for MyMap<K, V> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for (k, v) in &self.0 {
            writeln!(f, "{}: {}", k, v)?;
        }
        Ok(())
    }
}
```
Because tuple structs are zero-cost wrappers, this provides total encapsulation with 0 runtime overhead.
