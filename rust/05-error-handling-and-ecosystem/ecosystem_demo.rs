// rust/05-error-handling-and-ecosystem/ecosystem_demo.rs
//! Demonstrates Production Error Handling, Smart Pointers, Cow, and Unsafe FFI.

use std::borrow::Cow;
use std::fmt;

// =========================================================================
// 1. Production Error Hierarchy
// =========================================================================

#[derive(Debug)]
pub enum SystemError {
    ConfigMissing(String),
    NetworkTimeout(u64),
    ParseError(std::num::ParseIntError),
}

impl fmt::Display for SystemError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SystemError::ConfigMissing(key) => write!(f, "Missing configuration key: {}", key),
            SystemError::NetworkTimeout(ms) => write!(f, "Network request timed out after {}ms", ms),
            SystemError::ParseError(e) => write!(f, "Failed to parse integer: {}", e),
        }
    }
}

impl std::error::Error for SystemError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            SystemError::ParseError(e) => Some(e),
            _ => None,
        }
    }
}

impl From<std::num::ParseIntError> for SystemError {
    fn from(err: std::num::ParseIntError) -> Self {
        SystemError::ParseError(err)
    }
}

pub fn parse_timeout_config(raw_val: &str) -> Result<u64, SystemError> {
    // The `?` operator automatically converts ParseIntError to SystemError via From:
    let timeout: u64 = raw_val.trim().parse()?;
    Ok(timeout)
}

// =========================================================================
// 2. Recursive Binary Search Tree with Box<T>
// =========================================================================

pub struct TreeNode<T> {
    pub val: T,
    pub left: Option<Box<TreeNode<T>>>,
    pub right: Option<Box<TreeNode<T>>>,
}

impl<T: Ord> TreeNode<T> {
    pub fn new(val: T) -> Self {
        Self { val, left: None, right: None }
    }

    pub fn insert(&mut self, new_val: T) {
        if new_val < self.val {
            match self.left {
                Some(ref mut child) => child.insert(new_val),
                None => self.left = Some(Box::new(TreeNode::new(new_val))),
            }
        } else if new_val > self.val {
            match self.right {
                Some(ref mut child) => child.insert(new_val),
                None => self.right = Some(Box::new(TreeNode::new(new_val))),
            }
        }
    }

    pub fn contains(&self, target: &T) -> bool {
        if target == &self.val {
            true
        } else if target < &self.val {
            self.left.as_ref().map_or(false, |c| c.contains(target))
        } else {
            self.right.as_ref().map_or(false, |c| c.contains(target))
        }
    }
}

// =========================================================================
// 3. Zero-Allocation Sanitization with Cow
// =========================================================================

pub fn sanitize_header<'a>(input: &'a str) -> Cow<'a, str> {
    if input.contains('\r') || input.contains('\n') {
        Cow::Owned(input.replace('\r', "").replace('\n', ""))
    } else {
        Cow::Borrowed(input)
    }
}

// =========================================================================
// 4. Unsafe C-ABI FFI Function Export
// =========================================================================

#[no_mangle]
pub extern "C" fn rust_compute_sum(ptr: *const i32, len: usize) -> i64 {
    if ptr.is_null() || len == 0 {
        return 0;
    }

    // Safety: Caller must ensure ptr points to at least len valid i32 elements
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
    slice.iter().map(|&x| x as i64).sum()
}

fn main() {
    println!("=== RUST ERROR HANDLING & ECOSYSTEM DEMO ===");

    // 1. Error handling test
    match parse_timeout_config("5000") {
        Ok(t) => println!("Configured timeout: {}ms", t),
        Err(e) => eprintln!("Error: {}", e),
    }

    // 2. Binary search tree with Box
    let mut root = TreeNode::new(50);
    root.insert(25);
    root.insert(75);
    root.insert(10);
    println!("Contains 25: {}", root.contains(&25));
    println!("Contains 99: {}", root.contains(&99));

    // 3. Cow test
    let clean_header = "Content-Type: application/json";
    let res = sanitize_header(clean_header);
    println!("Cow header result: '{}' (Owned: {})", res, matches!(res, Cow::Owned(_)));
}
