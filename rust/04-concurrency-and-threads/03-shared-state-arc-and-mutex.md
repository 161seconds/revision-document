# Shared State Concurrency: `Arc`, `Mutex`, and `RwLock`

## 1. Thread-Safe Sharing: `Rc<T>` vs `Arc<T>`

In single-threaded Rust, `std::rc::Rc<T>` provides multiple ownership via reference counting. However, `Rc<T>` cannot be sent across threads:

```rust
// COMPILE ERROR! `Rc<T>` does not implement `Send`:
// thread::spawn(move || { let _ = rc_handle.clone(); });
```

### Why?
`Rc<T>` increments and decrements its counter using ordinary, non-atomic CPU instructions. If two threads clone `Rc<T>` concurrently, their increments can interleave, corrupting the counter and triggering double-free crashes.

### The Solution: `Arc<T>` (Atomic Reference Counted)
`std::sync::Arc<T>` uses **hardware-atomic memory instructions** (such as `lock xadd` on x86 or `ldrex`/`strex` on ARM) to mutate reference counters atomically:

```rust
use std::sync::Arc;

let shared_data = Arc::new(vec![1, 2, 3]);
let thread_handle = shared_data.clone(); // Atomically increments refcount
```

---

## 2. Mutex: Data Encapsulation & RAII Locks

In languages like C++ or Go, a mutex is an independent primitive that sits alongside the data:
```go
// Go/C++ vulnerability: Nothing prevents reading data without locking mu!
var mu sync.Mutex
var counter int
```

In Rust, **a `Mutex<T>` contains the data it protects**:
```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter_clone = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        // 1. Acquire lock: returns LockResult<MutexGuard<i32>>
        let mut num = counter_clone.lock().unwrap();

        // 2. DerefMut allows direct mutation of inner data:
        *num += 1;

        // 3. RAII Unlock: `num` (MutexGuard) drops here at scope exit!
        // Lock is released automatically even if a panic occurs!
    });
    handles.push(handle);
}

for h in handles {
    h.join().unwrap();
}

println!("Final count: {}", *counter.lock().unwrap()); // 10
```

---

## 3. Mutex Poisoning

If a thread **panics** while holding a `MutexGuard`, Rust intentionally marks the mutex as **poisoned**.
Why? The panicking thread may have left the protected data in an inconsistent, half-modified state.

Subsequent calls to `.lock()` return `Err(PoisonError)`:

```rust
let lock = Arc::new(Mutex::new(vec![1, 2, 3]));

// Panicking thread:
let c = Arc::clone(&lock);
let _ = thread::spawn(move || {
    let mut data = c.lock().unwrap();
    data.push(4);
    panic!("Fatal failure mid-write!"); // Mutex is poisoned upon panic!
}).join();

// Subsequent lock attempt detects the poisoning:
match lock.lock() {
    Ok(guard) => println!("Clean access: {:?}", *guard),
    Err(poison_err) => {
        println!("Warning: Mutex was poisoned by prior panic!");
        // You can still recover the underlying data if desired:
        let guard = poison_err.into_inner();
        println!("Recovered data: {:?}", *guard);
    }
}
```

---

## 4. Reader-Writer Locks: `RwLock<T>`

`Mutex<T>` allows only 1 thread at a time, even for read-only operations. If reads outnumber writes by 100:1, `Mutex<T>` creates massive thread contention.

`std::sync::RwLock<T>` mirrors Rust's compile-time borrow rules at runtime:
- **Multiple Readers (`.read()`)**: Concurrent read access permitted.
- **OR One Exclusive Writer (`.write()`)**: All other readers and writers are blocked.

```rust
use std::sync::RwLock;

let cache = RwLock::new(std::collections::HashMap::new());

// Multiple threads can read concurrently:
{
    let reader = cache.read().unwrap();
    let _ = reader.get("session_key");
} // Read lock released

// Single writer gains exclusive access:
{
    let mut writer = cache.write().unwrap();
    writer.insert("session_key", "valid");
} // Write lock released
```
