# Rust Module 04: Fearless Concurrency & Memory Safety

## Module Overview

Welcome to **Module 04: Fearless Concurrency & Memory Safety** of the Rust Systems Programming Track. In most languages, concurrent programming is notoriously error-prone, plagued by data races, race conditions, deadlocks, and silent memory corruption.

In Rust, the motto is **Fearless Concurrency**:
- **Data Race Freedom**: By definition, a data race occurs when two or more threads access the same memory location concurrently, at least one access is a write, and there is no synchronization. Rust's borrow checker eliminates data races **at compile time**!
- **`Send` and `Sync` Marker Traits**: Foundational contracts baked into the type system that govern thread boundary safety.
- **Message Passing (CSP)**: Multi-producer, single-consumer (`mpsc`) channels where data ownership is cleanly transferred across threads.
- **Shared State Concurrency**: `Arc<T>` (Atomic Reference Counting) paired with `Mutex<T>` or `RwLock<T>` guarantees that data can never be accessed without holding the lock.

---

## Detailed Curriculum

1. [`01-threads-and-move-closures.md`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/01-threads-and-move-closures.md): `std::thread::spawn`, `move` closures, `'static` thread lifetime bounds, and join handles.
2. [`02-message-passing-and-channels.md`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/02-message-passing-and-channels.md): CSP concurrency, `std::sync::mpsc`, bounded vs unbounded channels, and disconnect signalling.
3. [`03-shared-state-arc-and-mutex.md`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/03-shared-state-arc-and-mutex.md): `Arc<T>` vs `Rc<T>`, `Mutex<T>`, `MutexGuard` RAII unlock, `RwLock<T>`, and lock poisoning.
4. [`04-send-and-sync-marker-traits.md`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/04-send-and-sync-marker-traits.md): `Send` (ownership transfer) vs `Sync` (shared reference), auto-trait derivation, and `!Send`/`!Sync` types.
5. [`concurrency_demo.rs`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/concurrency_demo.rs): Complete Rust code demonstrating thread pools, `Arc<Mutex<T>>`, and MPSC channels.
6. [`practice.mjs`](file:///d:/my-project/revision-document/rust/04-concurrency-and-threads/practice.mjs): Self-testing suite validating thread ownership, channel backpressure, Arc/Mutex synchronization, poisoning, and Send/Sync invariants.

---

## Verification

Run the Module 04 verification suite:
```bash
rtk node rust/04-concurrency-and-threads/practice.mjs
```
