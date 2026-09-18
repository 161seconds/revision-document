# Cargo Workspaces, Build Profiles, and Binary Optimization

## 1. Cargo Workspaces: Monorepo Architecture

A Cargo workspace allows you to manage multiple related crates under a single version control repository, sharing a unified `Cargo.lock` file and `target/` build directory:

```toml
# Root Cargo.toml
[workspace]
resolver = "2"
members = [
    "crates/core-protocol",
    "crates/crypto-engine",
    "crates/server-cli",
]

# Shared workspace dependencies (Inherited by member crates):
[workspace.dependencies]
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

Inside member crate `crates/server-cli/Cargo.toml`:
```toml
[package]
name = "server-cli"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { workspace = true }
serde = { workspace = true }
core-protocol = { path = "../core-protocol" }
```

---

## 2. Release Profiles & Extreme Binary Size Optimization

By default, Rust binaries include debug symbols, unwinding tables, and separate LLVM compilation units.
For production deployments (cloud microservices, CLI binaries, embedded systems), fine-tune `[profile.release]`:

```toml
[profile.release]
# Optimization level: 3 is maximum speed, "z" or "s" is minimum size
opt-level = 3

# Link-Time Optimization: Enables inter-procedural optimization across ALL crates
lto = "fat"

# Reduce code-generation units to 1: Allows LLVM to inline code across the entire program
codegen-units = 1

# Abort on panic: Removes all stack unwinding tables and landing pads
panic = "abort"

# Strip symbols: Automatically strips debug symbols and symbols table from binary
strip = true
```

### Impact of Release Flags:
- Default Debug binary: **~35 MB**
- Standard Release binary: **~8 MB**
- Hardened LTO + Strip + Panic-Abort binary: **~1.2 MB** (up to **90%+ reduction**)!

---

## 3. Cargo Feature Flags & Conditional Compilation

Feature flags allow consumers of your crate to compile only the functionality they actually need, reducing dependency bloat:

```toml
# Cargo.toml
[features]
default = ["std", "tls-native"]
std = []
tls-native = ["dep:native-tls"]
tls-rustls = ["dep:rustls"]
json = ["dep:serde", "dep:serde_json"]

[dependencies]
native-tls = { version = "0.2", optional = true }
rustls = { version = "0.21", optional = true }
serde = { version = "1.0", optional = true }
serde_json = { version = "1.0", optional = true }
```

In Rust source code:
```rust
#[cfg(feature = "json")]
pub fn serialize_payload<T: serde::Serialize>(val: &T) -> String {
    serde_json::to_string(val).unwrap()
}

#[cfg(not(feature = "json"))]
pub fn serialize_payload<T>(_val: &T) -> String {
    compile_error!("JSON feature must be enabled to serialize payloads");
}
```
Consumers can disable default features and choose their exact backend:
```bash
cargo build --no-default-features --features "tls-rustls,json"
```
