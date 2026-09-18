# Rust Module 02: Structs, Enums & Pattern Matching

## Module Overview

Welcome to **Module 02: Structs, Enums & Pattern Matching** of the Rust Systems Programming Track. Rust's data modeling leverages **Algebraic Data Types (ADTs)**:
- **Product Types (Structs)**: Bundle heterogenous data fields with precise memory layout guarantees (`#[repr(C)]`, packed, default).
- **Sum Types (Enums)**: Tagged unions where a value can be exactly one of several distinct variants, enabling first-class support for `Option<T>` and `Result<T, E>`.
- **Exhaustive Pattern Matching**: Compiler-verified branching that prevents unhandled edge cases at zero runtime overhead.
- **Type-State Pattern**: Compile-time state machines where transitions consume the previous state and return the next state, preventing illegal operations before code runs.

---

## Detailed Curriculum

1. [`01-structs-and-methods.md`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/01-structs-and-methods.md): Named, Tuple, and Unit structs; `impl` blocks; methods (`&self`, `&mut self`, `self`) vs associated functions.
2. [`02-enums-option-and-result.md`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/02-enums-option-and-result.md): Tagged unions, Sum Types, `Option<T>`, `Result<T, E>`, and Null Pointer Optimization (NPO).
3. [`03-pattern-matching-and-destructuring.md`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/03-pattern-matching-and-destructuring.md): `match` exhaustiveness, match guards, `@` binding, `if let`, and `while let`.
4. [`04-algebraic-data-types-and-state-machines.md`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/04-algebraic-data-types-and-state-machines.md): Zero-cost type-state machines, compile-time protocol enforcement, and Zero-Sized Types (ZSTs).
5. [`types_demo.rs`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/types_demo.rs): Complete Rust code demonstration of ADTs, type-state pattern, and monadic error propagation.
6. [`practice.mjs`](file:///d:/my-project/revision-document/rust/02-structs-enums-and-pattern-matching/practice.mjs): Self-testing suite validating ADTs, monadic combinators, pattern exhaustiveness, and type-state invariants.

---

## Verification

Run the Module 02 verification suite:
```bash
rtk node rust/02-structs-enums-and-pattern-matching/practice.mjs
```
