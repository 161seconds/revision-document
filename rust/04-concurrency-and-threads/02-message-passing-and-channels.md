# Message Passing Concurrency & MPSC Channels

## 1. The CSP Concurrency Philosophy

Rust embraces the Communicating Sequential Processes (CSP) paradigm:
> *"Do not communicate by sharing memory; instead, share memory by communicating."*

When you send a value through a channel in Rust, **ownership of the value is transferred** across the thread boundary. The sending thread loses access to the variable immediately, preventing data races by construction without needing locks.

---

## 2. Multi-Producer, Single-Consumer (`mpsc`)

The standard library provides `std::sync::mpsc`:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel(); // Creates unbounded channel

// Spawn producer thread 1:
let tx1 = tx.clone();
thread::spawn(move || {
    let message = String::from("Telemetry batch A");
    tx1.send(message).unwrap();
    // `message` has been moved; cannot access it here!
});

// Spawn producer thread 2:
let tx2 = tx.clone();
thread::spawn(move || {
    let message = String::from("Telemetry batch B");
    tx2.send(message).unwrap();
});

// Drop original tx so receiver knows all senders are done:
drop(tx);

// Consumer reads until all senders are dropped:
for received in rx {
    println!("Processed: {}", received);
}
```

---

## 3. Bounded Channels & Backpressure (`sync_channel`)

By default, `mpsc::channel()` is **unbounded**: its buffer grows indefinitely in heap memory. If producers run faster than consumers, memory usage will spike until an Out-Of-Memory (OOM) crash occurs.

In production systems, use **bounded channels** via `sync_channel(bound)`:

```rust
use std::sync::mpsc::sync_channel;

// Buffer capacity = 100 messages:
let (tx, rx) = sync_channel(100);

thread::spawn(move || {
    for i in 0..1000 {
        // If buffer has 100 unread messages, send() BLOCKS until consumer frees space!
        tx.send(i).unwrap();
    }
});
```

### Backpressure Invariant
Bounded channels enforce **backpressure**: slow consumers naturally throttle fast producers, keeping memory footprints constant and predictable under load.

---

## 4. Channel Disconnection & EOF Signaling

A channel disconnects cleanly when:
1. **All Senders Drop**: When every clone of `tx` goes out of scope, the receiver's next call to `rx.recv()` immediately returns `Err(RecvError)`. In a `for msg in rx` loop, this terminates the iteration cleanly (EOF).
2. **Receiver Drops**: If `rx` drops while producers are still alive, any subsequent call to `tx.send(msg)` will return `Err(SendError(msg))`, returning the unsent message back to the sender so no data is silently lost!
