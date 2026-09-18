# Pattern Matching, Destructuring, and Guards

## 1. Exhaustive Pattern Matching

The `match` expression in Rust is **strictly exhaustive**: the compiler statically guarantees that every potential branch of an algebraic data type is handled. If a new variant is added to an enum, the compiler immediately rejects all incomplete match blocks across the codebase.

```rust
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
}

fn is_idempotent(method: HttpMethod) -> bool {
    match method {
        HttpMethod::Get | HttpMethod::Put | HttpMethod::Delete => true,
        HttpMethod::Post | HttpMethod::Patch => false,
        // If HttpMethod::Head is added later, compiler forces you to handle it here!
    }
}
```

---

## 2. Advanced Destructuring & Pattern Guards

### 2.1 Destructuring Nested Structs and Enums
Patterns can unpack complex nested records in a single statement:

```rust
pub struct Point3D {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

pub enum Command {
    MoveTo(Point3D),
    SetLabel(String),
    Reset,
}

fn process_command(cmd: Command) {
    match cmd {
        // Match specific coordinate combinations:
        Command::MoveTo(Point3D { x: 0, y: 0, z: 0 }) => {
            println!("Moved to Origin");
        }
        // Match with wildcard ignore `..`:
        Command::MoveTo(Point3D { z, .. }) if z < 0 => {
            println!("Target is underground! z = {}", z);
        }
        Command::MoveTo(Point3D { x, y, z }) => {
            println!("Moving to ({}, {}, {})", x, y, z);
        }
        Command::SetLabel(ref label) if label.is_empty() => {
            println!("Ignoring empty label");
        }
        Command::SetLabel(label) => {
            println!("Label set to: {}", label);
        }
        Command::Reset => println!("System reset"),
    }
}
```

### 2.2 Match Guards (`if condition`)
A match guard provides secondary conditional filtering after the pattern matches. Note that the compiler cannot verify exhaustiveness of arbitrary guards, so a fallback without guard or wildcard `_` is required.

### 2.3 `@` Variable Bindings
The `@` operator lets you test a value against a pattern while simultaneously binding that value to a variable:

```rust
pub enum Message {
    Packet { id: u32, size_bytes: usize },
}

fn handle_packet(msg: Message) {
    match msg {
        // Test range AND bind size variable:
        Message::Packet { size_bytes: sz @ 1024..=65536, id } => {
            println!("Medium packet {} of size {}", id, sz);
        }
        Message::Packet { size_bytes: sz, id } if sz > 65536 => {
            println!("Jumbo packet {} exceeds MTU!", id);
        }
        Message::Packet { id, .. } => {
            println!("Small packet {}", id);
        }
    }
}
```

---

## 3. Ergonomic Control Flow: `if let` and `while let`

When matching against only one pattern and ignoring all others, `match` can feel verbose. Rust provides concise syntactic sugar:

### 3.1 `if let`
```rust
let opt_config: Option<String> = load_config();

// Instead of verbose match:
if let Some(path) = opt_config {
    println!("Loading config from: {}", path);
} else {
    println!("Using default config");
}
```

### 3.2 `while let`
Continues looping as long as the pattern successfully matches:
```rust
let mut queue = vec![10, 20, 30];

// Pops elements until vector is empty (pop returns None):
while let Some(item) = queue.pop() {
    println!("Processing: {}", item);
}
```

### 3.3 `matches!` Macro
Tests if an expression matches a pattern and returns a boolean without unwrapping:
```rust
let status = HttpResponse::NotFound;
if matches!(status, HttpResponse::NotFound | HttpResponse::Gone) {
    println!("Resource no longer available");
}
```
