# Static vs Dynamic Dispatch: `impl Trait` vs `dyn Trait`

## 1. Static Dispatch (`impl Trait`)

Static dispatch resolves function calls at **compile time**. The compiler knows the exact concrete type and inlines the method call directly into CPU instructions:

```rust
// Generic / Static Dispatch:
pub fn render_static(renderer: &impl Renderable) {
    renderer.render(); // Inlined directly; zero runtime overhead
}
```

### Advantages:
- Maximum speed: No pointer dereferences; enables aggressive LLVM optimizations like loop unrolling and auto-vectorization.
- Type sizes are statically known at compile time.

---

## 2. Dynamic Dispatch (`dyn Trait`)

Dynamic dispatch resolves method calls at **runtime** using a virtual method table (**vtable**). It is indicated with the `dyn` keyword:

```rust
// Dynamic Dispatch:
pub fn render_dynamic(renderer: &dyn Renderable) {
    renderer.render(); // Indirect call through vtable pointer
}
```

### The Fat Pointer Memory Layout
A normal Rust reference (`&T`) is a single 64-bit pointer (8 bytes).
However, a trait object reference (`&dyn Trait` or `Box<dyn Trait>`) is a **Fat Pointer** consuming **16 bytes**:

```
+-----------------------------------+-----------------------------------+
|     Data Pointer (8 bytes)        |    vtable Pointer (8 bytes)       |
+-----------------------------------+-----------------------------------+
| Points to concrete struct on      | Points to statically generated    |
| stack or heap (e.g. &MyWidget)    | table of function pointers        |
+-----------------------------------+-----------------------------------+
```

### Inside the vtable:
1. `drop_in_place`: Pointer to destructor for the concrete type.
2. `size`: Size in bytes of the concrete type (needed for deallocation).
3. `align`: Hardware alignment requirement.
4. Pointers to each trait method implementation.

---

## 3. Object Safety Rules

Not every trait can be turned into a trait object (`dyn Trait`). To be **object-safe**, a trait must satisfy strict rules:

### Rule 1: Methods must NOT return `Self`
If a method returns `Self`, the caller must allocate space on the stack for the return value. But for `dyn Trait`, the concrete size of `Self` is unknown at compile time!
```rust
pub trait Cloneable {
    fn clone_self(&self) -> Self; // NOT OBJECT SAFE!
}
// Error: `dyn Cloneable` cannot be made into an object
```

### Rule 2: Methods must NOT have generic type parameters
The compiler generates vtable function pointers at compile time. If a method is generic (`fn execute<T>(&self, val: T)`), there would need to be an infinite number of function pointers in the vtable for every possible `T`!
```rust
pub trait Processor {
    fn process<T>(&self, val: T); // NOT OBJECT SAFE!
}
```

### Rule 3: The trait must not require `Self: Sized`
Trait objects are dynamically sized types (DSTs).

### Making Traits Object-Safe with `where Self: Sized`
If a trait has a helper method that returns `Self`, you can exclude that specific method from trait objects:
```rust
pub trait Service {
    fn handle(&self); // Object safe

    // Excluded from dyn Service vtable:
    fn clone_box(&self) -> Box<Self> where Self: Sized {
        // ...
    }
}
```

---

## 4. Architectural Decision Matrix

| Requirement | Choose `impl Trait` (Static) | Choose `dyn Trait` (Dynamic) |
|---|---|---|
| **Heterogeneous Collections** | Impossible (`Vec<T>` must be single type) | **Yes** (`Vec<Box<dyn Plugin>>`) |
| **Plugin Systems / Extensibility** | Difficult (types must be known at build time) | **Yes** (runtime loaded modules) |
| **High-Frequency Loops / SIMD** | **Yes** (zero indirect branches) | No (vtable branch misprediction penalty) |
| **Binary Size Constrained (Embedded)** | Can bloat if many types monomorphize | **Yes** (single compiled vtable implementation) |
