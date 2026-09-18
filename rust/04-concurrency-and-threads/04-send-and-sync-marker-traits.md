# `Send` and `Sync`: The Mathematical Core of Fearless Concurrency

## 1. What Are Marker Traits?

In Rust, `Send` and `Sync` are **unsafe marker traits**:
- They contain **zero methods**.
- They exist solely to convey mathematical concurrency properties to the compiler.
- They are **auto traits**: if every field in a struct implements `Send`, the struct automatically implements `Send` without manual `impl` boilerplate.

---

## 2. Definitions: `Send` vs `Sync`

### Definition 1: `Send`
> **A type `T` is `Send` if ownership of a value of type `T` can be transferred across a thread boundary.**

Virtually all pure Rust types are `Send` (e.g. `i32`, `String`, `Vec<u8>`). When you move an owned value into `thread::spawn(move || ...)`, the compiler checks that `T: Send`.

### Definition 2: `Sync`
> **A type `T` is `Sync` if and only if references to `T` (`&T`) can be safely shared across multiple threads.**

The fundamental mathematical equivalence in Rust concurrency is:
```
T: Sync   <===>   &T: Send
```
If sharing an immutable reference `&T` across threads is safe, then `&T` can be transferred (`Send`) across threads!

---

## 3. The Concurrency Trait Matrix

| Type | `Send`? | `Sync`? | Reason |
|---|---|---|---|
| `i32`, `String`, `Vec<T>` (if `T: Send`) | **Yes** | **Yes** | Pure data; immutable borrowing is inherently thread-safe. |
| `Rc<T>` | **No** | **No** | Non-atomic reference counting will corrupt under concurrent threads. |
| `Arc<T>` (if `T: Send + Sync`) | **Yes** | **Yes** | Atomic reference counting allows safe multi-thread cloning. |
| `RefCell<T>` | **Yes** | **No** | Runtime borrow checking uses non-atomic counters; safe to move to another thread, but cannot share references across threads. |
| `Mutex<T>` (if `T: Send`) | **Yes** | **Yes** | Even if `T` is `!Sync`, wrapping it in `Mutex<T>` makes it `Sync` because the lock enforces exclusive access! |
| Raw Pointers (`*const T`, `*mut T`) | **No** | **No** | Compiler makes no safety assumptions about raw C-style pointers. |

---

## 4. How `Mutex<T>` Turns `!Sync` into `Sync`

Consider `Cell<T>` or `RefCell<T>`. Neither is `Sync` because their interior mutability counters are not thread-safe.

However, `Mutex<T>` has this trait implementation in `std`:
```rust
unsafe impl<T: ?Sized + Send> Sync for Mutex<T> {}
```

Notice the bound:
As long as `T` is `Send`, `Mutex<T>` is **guaranteed to be `Sync`**!
Even though `T` by itself cannot be safely shared across threads via `&T`, the `Mutex` wrapper guarantees that only one thread can ever access `T` at any instant. Thus, `Mutex<T>` makes thread-safe sharing possible.

---

## 5. Compile-Time Prevention of Concurrency Bugs

If you attempt to pass an `Rc<T>` across a thread:
```rust
use std::rc::Rc;
use std::thread;

let non_atomic = Rc::new(42);

thread::spawn(move || {
    println!("{}", non_atomic);
});
```

The Rust compiler halts compilation with this error:
```
error[E0277]: `Rc<i32>` cannot be sent between threads safely
   --> src/main.rs:6:5
    |
6   |     thread::spawn(move || {
    |     ^^^^^^^^^^^^^ `Rc<i32>` cannot be sent between threads safely
    |
    = help: the trait `Send` is not implemented for `Rc<i32>`
    = note: required for `[closure]` to implement `Send`
```
No data races, no memory leaks, and no runtime debugging required. The bug is killed at compile time!
