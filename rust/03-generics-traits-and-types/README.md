# Rust Module 03: Generics, Traits & Advanced Type System

## Module Overview

Welcome to **Module 03: Generics, Traits & Advanced Type System** of the Rust Systems Programming Track. Rust does not have classical object-oriented inheritance (classes and virtual tables by default). Instead, Rust separates **data structure definition (structs)** from **polymorphic behavior (traits)**:
- **Generics**: Abstract code across types without runtime penalty via **monomorphization**.
- **Trait Bounds & `where` Clauses**: Constrain generic capabilities at compile-time with high expressiveness.
- **Static Dispatch (`impl Trait`) vs Dynamic Dispatch (`dyn Trait`)**: Choose between inlined zero-cost machine code or compact fat-pointer vtable indirection.
- **Standard Library Traits**: Foundational contracts (`Clone`, `Copy`, `Drop`, `Deref`, `From`/`Into`, `Iterator`).
- **Object Safety**: Formal mathematical rules governing which traits can be represented as runtime trait objects.

---

## Detailed Curriculum

1. [`01-generics-and-trait-bounds.md`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/01-generics-and-trait-bounds.md): Generic types, functions, trait bounds, `where` clauses, and the mechanics of monomorphization.
2. [`02-traits-and-associated-types.md`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/02-traits-and-associated-types.md): Defining traits, default methods, associated types (`type Item`), and the Orphan Rule.
3. [`03-static-vs-dynamic-dispatch.md`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/03-static-vs-dynamic-dispatch.md): `impl Trait` vs `dyn Trait`, fat pointer memory layout (data ptr + vtable ptr), and object safety rules.
4. [`04-standard-library-traits.md`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/04-standard-library-traits.md): Core traits (`Clone`, `Copy`, `Drop`, `Deref`, `AsRef`, `From`, `Into`, `Iterator`).
5. [`traits_demo.rs`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/traits_demo.rs): Complete Rust demonstration of static vs dynamic dispatch, custom iterators, and traits.
6. [`practice.mjs`](file:///d:/my-project/revision-document/rust/03-generics-traits-and-types/practice.mjs): Self-testing suite validating fat-pointer vtables, trait bounds, iterators, From/Into, and object safety invariants.

---

## Verification

Run the Module 03 verification suite:
```bash
rtk node rust/03-generics-traits-and-types/practice.mjs
```
