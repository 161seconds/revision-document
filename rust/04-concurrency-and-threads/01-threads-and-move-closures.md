# Native OS Threads, `move` Closures, and Lifetimes

## 1. 1:1 Operating System Threads

Rust's standard library uses a **1:1 threading model**: each Rust thread corresponds directly to a native Operating System thread scheduled by the OS kernel:

```rust
use std::thread;
use std::time::Duration;

let handle = thread::spawn(|| {
    for i in 1..=5 {
        println!("Child thread count: {}", i);
        thread::sleep(Duration::from_millis(50));
    }
    42 // Return value from thread closure
});

// Wait for child thread to complete and retrieve its result:
let result = handle.join().expect("Child thread panicked!");
println!("Child returned: {}", result);
```

---

## 2. The `move` Closure Requirement

When you spawn a thread, the thread closure must be able to outlive the function that created it. By default, closures attempt to capture variables by reference (`&T` or `&mut T`).

```rust
let data = vec![1, 2, 3];

// COMPILE ERROR without `move`:
// thread::spawn(|| {
//     println!("{:?}", data); // Error: `data` does not live long enough!
// });
```

### Why does this fail?
The parent function could return immediately after spawning the thread, deallocating `data` from its stack frame while the child thread is still executing, leading to a disastrous **Use-After-Free**!

### The Solution: `move`
The `move` keyword forces the closure to **take ownership** of captured variables, transferring their stack ownership directly into the child thread:

```rust
let data = vec![1, 2, 3];

thread::spawn(move || {
    // `data` is moved here; completely owned by child thread
    println!("Safely owned in thread: {:?}", data);
});
// `data` is no longer accessible in the parent thread!
```

---

## 3. Scoped Threads (`std::thread::scope`)

Sometimes, threads only need to do parallel work and finish before the current function continues. Moving data and cloning pointers is wasteful.

Introduced in Rust 1.63, **Scoped Threads** allow threads to borrow non-`'static` data safely from the parent stack frame:

```rust
let mut numbers = vec![1, 2, 3, 4, 5, 6];

// Guarantees all spawned threads inside scope complete before block exits:
thread::scope(|s| {
    // Split slice into two disjoint mutable slices:
    let (left, right) = numbers.split_at_mut(3);

    s.spawn(|| {
        for n in left { *n *= 10; }
    });

    s.spawn(|| {
        for n in right { *n *= 100; }
    });
}); // <--- Implicit join of all scoped threads occurs here!

// Completely safe to read `numbers` again without Arc or Mutex:
println!("Mutated in parallel: {:?}", numbers);
// Output: [10, 20, 30, 400, 500, 600]
```
Because the scope blocks until both threads complete, the borrow checker statically proves that the parent stack frame outlives all child thread borrows!
