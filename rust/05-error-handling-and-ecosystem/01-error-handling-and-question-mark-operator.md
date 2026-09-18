# Production Error Handling & The `?` Operator

## 1. Recoverable (`Result`) vs Unrecoverable (`panic!`)

In Rust, errors are cleanly split into two distinct categories:

| Category | Primitive | Mechanism | Handling Strategy |
|---|---|---|---|
| **Recoverable** | `Result<T, E>` | Values returned via normal control flow | Handled explicitly with `match`, combinators, or `?` |
| **Unrecoverable** | `panic!()` | Stack unwinding or immediate process abort | Reserved for bug assertions, index out of bounds, or fatal corruption |

---

## 2. The `?` Operator Mechanics

The `?` operator provides early-return error propagation without nesting:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_server_port(path: &str) -> Result<u16, io::Error> {
    let mut file = File::open(path)?; // Returns early if File::open fails
    let mut contents = String::new();
    file.read_to_string(&mut contents)?; // Returns early if read fails

    // What happens under the hood:
    // match File::open(path) {
    //     Ok(f) => f,
    //     Err(e) => return Err(std::convert::From::from(e)),
    // }
    
    // ...
    Ok(8080)
}
```

### The Magic of `From::from` in `?`
Notice `From::from(e)`:
If the function returns `Result<T, MyCustomError>`, and an inner call returns `io::Error`, the `?` operator **automatically converts** `io::Error` into `MyCustomError` as long as `MyCustomError` implements `From<io::Error>`!

---

## 3. Designing Production Error Types

### 3.1 Library Errors: Explicit Enum (`thiserror` Pattern)
Libraries should expose strongly typed enums so callers can programmatically inspect and handle specific error conditions:

```rust
use std::fmt;

#[derive(Debug)]
pub enum DatabaseError {
    ConnectionFailed(String),
    QueryTimeout { seconds: u32 },
    Serialization(serde_json::Error),
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DatabaseError::ConnectionFailed(msg) => write!(f, "DB connection failed: {}", msg),
            DatabaseError::QueryTimeout { seconds } => write!(f, "Query timed out after {}s", seconds),
            DatabaseError::Serialization(e) => write!(f, "JSON serialization error: {}", e),
        }
    }
}

impl std::error::Error for DatabaseError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            DatabaseError::Serialization(e) => Some(e),
            _ => None,
        }
    }
}

// Enable `?` for serde_json:
impl From<serde_json::Error> for DatabaseError {
    fn from(err: serde_json::Error) -> Self {
        DatabaseError::Serialization(err)
    }
}
```

### 3.2 Application Errors: Contextual Dynamic Errors (`anyhow` Pattern)
In binary CLI tools or web servers, callers rarely match on exact error variants; they need rich diagnostic context and backtraces:

```rust
// Using `anyhow` style idiom:
fn initialize_system() -> Result<(), anyhow::Error> {
    load_tls_certificates()
        .context("Failed to load TLS certs from /etc/ssl")?;

    connect_primary_db()
        .context("Could not establish connection to PostgreSQL replica")?;

    Ok(())
}
```

---

## 4. Panic Strategies: Unwind vs Abort

In `Cargo.toml`, you can configure how the runtime responds to panics:

```toml
[profile.release]
panic = "abort" # Default is "unwind"
```

- **`unwind` (Default)**: The runtime walks back up the stack frame by frame, executing `drop()` destructors for all local variables. Allows threads to catch panics via `std::panic::catch_unwind`. Requires extra landing pad metadata in the binary.
- **`abort`**: Immediately terminates the OS process (SIGABRT). Generates significantly smaller binary sizes and eliminates stack unwinding code, making it the preferred choice for embedded microcontrollers and high-security containers.
