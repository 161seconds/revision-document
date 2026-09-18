# Smart Pointers: `Box`, `Rc`, `RefCell`, and `Cow`

## 1. What Makes a Pointer "Smart"?

In Rust, ordinary references (`&T`, `&mut T`) are non-owning borrowing pointers.
A **Smart Pointer** is a struct that owns the data it points to and implements:
1. `Deref`: Allows smart pointers to be dereferenced transparently like references (`*ptr` or method calls).
2. `Drop`: Automatically frees heap memory and system resources when the pointer goes out of scope.

---

## 2. `Box<T>`: Heap Allocation & Recursive Types

`Box<T>` stores data on the heap rather than the stack:
- The pointer (8 bytes on 64-bit systems) lives on the stack.
- The payload lives on the heap.

```rust
let val = Box::new(1024); // Heap allocation
println!("Val: {}", *val); // Dereferenced via Deref
```

### Enabling Recursive Data Types
The compiler must know the exact memory size of every type at compile time. A recursive type without `Box` has infinite size:

```rust
// COMPILE ERROR: Recursive type has infinite size!
// enum LinkedList {
//     Node(i32, LinkedList),
//     Nil,
// }

// With Box<T>, LinkedList has a known, fixed size:
pub enum LinkedList {
    Node(i32, Box<LinkedList>), // Size is 8 bytes for Box pointer + 4 bytes for i32!
    Nil,
}
```

---

## 3. `Rc<T>`: Shared Ownership

When multiple parts of a single-threaded program need read-only access to the same heap allocation:

```rust
use std::rc::Rc;

let shared_config = Rc::new(vec!["prod-api.internal", "backup-api.internal"]);

let service_a = Rc::clone(&shared_config); // Increments refcount to 2
let service_b = Rc::clone(&shared_config); // Increments refcount to 3

println!("Strong count: {}", Rc::strong_count(&shared_config)); // 3
// When each service drops its clone, refcount decrements.
// When refcount reaches 0, heap memory is deallocated.
```

---

## 4. `RefCell<T>`: Dynamic Interior Mutability

By default, Rust's borrow rules are enforced at compile time. Sometimes, you need to mutate data inside an immutable structure (e.g., mock objects in tests, graph node back-pointers).

`RefCell<T>` enforces borrow rules **at runtime**:

```rust
use std::cell::RefCell;

let cell = RefCell::new(vec![1, 2, 3]);

// Immutable borrow at runtime:
{
    let read_guard = cell.borrow(); // Returns Ref<Vec<i32>>
    println!("Length: {}", read_guard.len());
} // Borrow ends

// Mutable borrow at runtime:
{
    let mut write_guard = cell.borrow_mut(); // Returns RefMut<Vec<i32>>
    write_guard.push(4);
} // Mut borrow ends
```

### The Runtime Panic Invariant:
If you violate borrow rules at runtime:
```rust
let a = cell.borrow();
let b = cell.borrow_mut(); // PANIC at runtime! "already borrowed: BorrowMutError"
```

---

## 5. `Cow<'a, B>`: Clone-On-Write Optimization

`std::borrow::Cow` (Clone-On-Write) avoids heap allocations when data only needs to be read:

```rust
pub enum Cow<'a, B: ?Sized + 'a>
where
    B: ToOwned,
{
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

### Production Example: String Sanitizer
```rust
use std::borrow::Cow;

fn sanitize_sql_identifier<'a>(input: &'a str) -> Cow<'a, str> {
    if input.contains(';') || input.contains(' ') {
        // Mutation needed: allocate a new String and return Cow::Owned
        let cleaned = input.replace(';', "").replace(' ', "_");
        Cow::Owned(cleaned)
    } else {
        // No mutation needed: return zero-allocation reference Cow::Borrowed!
        Cow::Borrowed(input)
    }
}

fn main() {
    let clean = "user_id";
    let res1 = sanitize_sql_identifier(clean);
    // Zero allocation! Points to clean string slice directly:
    assert!(matches!(res1, Cow::Borrowed(_)));

    let dirty = "admin; DROP TABLE";
    let res2 = sanitize_sql_identifier(dirty);
    // Allocated only when modifications were necessary:
    assert!(matches!(res2, Cow::Owned(_)));
}
```
In high-throughput parsing pipelines, `Cow` delivers massive latency reductions by eliminating 90%+ of temporary heap allocations.
