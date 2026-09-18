# Type-State Pattern & Compile-Time State Machines

## 1. Making Illegal States Unrepresentable

In traditional languages, state machines are often implemented with an internal enum or integer flag (`connection.state == State.CONNECTED`). Every method must then check this flag at runtime:

```java
// Traditional OOP Anti-Pattern:
void send(byte[] data) {
    if (this.state != State.CONNECTED) {
        throw new IllegalStateException("Not connected!"); // RUNTIME ERROR!
    }
    // ...
}
```

In Rust systems programming, we leverage the **Type-State Pattern**:
1. Encode each state as a distinct **Zero-Sized Type (ZST)**.
2. Parameterize the main struct by its current state type using `PhantomData`.
3. Only implement methods on the specific state where those operations are legally valid.
4. State transitions **consume `self` by value**, destroying the old state and returning the new state.

**Result**: It is impossible to call a method in an invalid state—the code will refuse to compile!

---

## 2. Complete Type-State Implementation

```rust
use std::marker::PhantomData;

// 1. Define Zero-Sized Marker Structs for each state:
pub struct Disconnected;
pub struct Connecting;
pub struct Connected;

// 2. The generic state machine:
pub struct TcpSession<State> {
    target_addr: String,
    socket_fd: Option<i32>,
    _marker: PhantomData<State>, // Zero bytes overhead!
}

// 3. Methods available ONLY in Disconnected state:
impl TcpSession<Disconnected> {
    pub fn new(target_addr: String) -> Self {
        Self {
            target_addr,
            socket_fd: None,
            _marker: PhantomData,
        }
    }

    // Transition: Consumes Disconnected, returns Connecting
    pub fn initiate_handshake(self) -> TcpSession<Connecting> {
        println!("Sending SYN to {}", self.target_addr);
        TcpSession {
            target_addr: self.target_addr,
            socket_fd: Some(101),
            _marker: PhantomData,
        }
    }
}

// 4. Methods available ONLY in Connecting state:
impl TcpSession<Connecting> {
    // Transition: Consumes Connecting, returns Connected
    pub fn complete_handshake(self) -> Result<TcpSession<Connected>, String> {
        println!("Received SYN-ACK, sending ACK to {}", self.target_addr);
        Ok(TcpSession {
            target_addr: self.target_addr,
            socket_fd: self.socket_fd,
            _marker: PhantomData,
        })
    }

    pub fn abort(self) -> TcpSession<Disconnected> {
        println!("Handshake timed out");
        TcpSession {
            target_addr: self.target_addr,
            socket_fd: None,
            _marker: PhantomData,
        }
    }
}

// 5. Methods available ONLY in Connected state:
impl TcpSession<Connected> {
    pub fn send_payload(&self, data: &[u8]) {
        println!("Sending {} bytes over socket {:?}", data.len(), self.socket_fd);
    }

    // Teardown: Consumes Connected, returns Disconnected
    pub fn disconnect(self) -> TcpSession<Disconnected> {
        println!("Sending FIN packet");
        TcpSession {
            target_addr: self.target_addr,
            socket_fd: None,
            _marker: PhantomData,
        }
    }
}
```

### Compiler Guarantee Verification:
```rust
fn main() {
    let session = TcpSession::new("127.0.0.1:8080".to_string());
    
    // COMPILE ERROR! No method named `send_payload` found for `TcpSession<Disconnected>`:
    // session.send_payload(b"Hello");

    // Correct lifecycle:
    let connecting = session.initiate_handshake();
    let connected = connecting.complete_handshake().unwrap();
    connected.send_payload(b"GET / HTTP/1.1\r\n\r\n"); // Works!
    let _closed = connected.disconnect();
}
```

---

## 3. Zero-Cost Performance Profile

- **Zero-Sized Types (`Disconnected`, `Connecting`, `Connected`)**:
  - `std::mem::size_of::<Disconnected>() == 0 bytes`.
- **`PhantomData<T>`**:
  - Instructs the compiler's type-checker to track `T`, but generates **0 machine instructions** and **0 bytes of memory layout**.
- **`self` Move Transitions**:
  - Because `TcpSession` contains only pointer and integer fields, the compiler optimizes transitions directly into CPU registers or in-place stack writes without heap allocations or runtime branch checks.
