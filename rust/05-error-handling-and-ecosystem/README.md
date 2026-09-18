# Rust Module 05: Error Handling, Smart Pointers & Ecosystem

## Module Overview

Welcome to **Module 05: Error Handling, Smart Pointers & Ecosystem** of the Rust Systems Programming Track. This module covers advanced memory management, production error architectures, Cargo tooling, and the boundary between Safe and Unsafe Rust:
- **Idiomatic Error Handling**: Distinguish recoverable errors (`Result<T, E>`) from unrecoverable panics. Harness the `?` operator and the `thiserror`/`anyhow` idioms.
- **Smart Pointers**:
  - `Box<T>`: Explicit heap allocation and sizing recursive types.
  - `Rc<T>` & `RefCell<T>`: Single-threaded reference counting with interior mutability.
  - `Cow<'a, B>`: Clone-On-Write zero-allocation optimizations for read-heavy workloads.
- **Cargo Ecosystem & Build Optimization**: Multi-crate workspaces, feature flags, Link-Time Optimization (LTO), and stripping binaries for embedded/cloud environments.
- **Unsafe Rust & FFI**: The 5 unsafe superpowers, raw pointer manipulation, C-ABI interoperability (`extern "C"`), and avoiding Undefined Behavior (UB).

---

## Detailed Curriculum

1. [`01-error-handling-and-question-mark-operator.md`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/01-error-handling-and-question-mark-operator.md): Recoverable vs unrecoverable errors, the `?` operator, `From` conversion chaining, and custom error types.
2. [`02-smart-pointers-box-rc-refcell.md`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/02-smart-pointers-box-rc-refcell.md): `Box<T>`, recursive data structures, `RefCell<T>` dynamic borrow checking, and `Cow<'a, B>`.
3. [`03-cargo-workspaces-and-profiles.md`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/03-cargo-workspaces-and-profiles.md): Workspaces, release profiles, LTO, `panic = "abort"`, and feature flags.
4. [`04-unsafe-rust-and-ffi-boundaries.md`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/04-unsafe-rust-and-ffi-boundaries.md): Raw pointers (`*const T`, `*mut T`), FFI, `extern "C"`, UB guarantees, and Miri.
5. [`ecosystem_demo.rs`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/ecosystem_demo.rs): Complete Rust demonstration of custom errors, `Box` recursive trees, `Cow`, and FFI bindings.
6. [`practice.mjs`](file:///d:/my-project/revision-document/rust/05-error-handling-and-ecosystem/practice.mjs): Self-testing suite validating error propagation, recursive box memory sizing, RefCell borrow checks, Cow zero-copy, and raw pointer alignment.

---

## Verification

Run the Module 05 verification suite:
```bash
rtk node rust/05-error-handling-and-ecosystem/practice.mjs
```
