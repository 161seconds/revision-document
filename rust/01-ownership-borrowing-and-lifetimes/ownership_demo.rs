// Rust Module 01: Ownership, Borrowing & Lifetimes Reference Demonstration

fn main() {
    println!("=== 1. Move Semantics vs Copy Trait ===");
    // Copy type (primitive i32 on stack)
    let a = 42;
    let b = a;
    println!("Stack Copy: a = {}, b = {}", a, b); // Both a and b remain valid

    // Move type (Heap allocated String)
    let s1 = String::from("Rust Systems");
    let s2 = s1; // Ownership moved to s2! s1 is invalidated.
    // println!("{}", s1); // Error: value borrowed here after move
    println!("Heap Move: s2 = {}", s2);

    // Deep clone
    let s3 = s2.clone();
    println!("Deep Clone: s2 = {}, s3 = {}", s2, s3);

    println!("\n=== 2. Borrowing: Aliasing XOR Mutability ===");
    let mut data = String::from("Core Engine");

    // Multiple immutable borrows allowed simultaneously
    {
        let r1 = &data;
        let r2 = &data;
        println!("Concurrent Readers: '{}' and '{}'", r1, r2);
    } // r1 and r2 go out of scope here

    // Exclusive mutable borrow
    {
        let w = &mut data;
        w.push_str(" [Active]");
        println!("Exclusive Writer: {}", w);
    }

    println!("\n=== 3. Lifetimes and Slices ===");
    let text1 = String::from("longest-string-sample");
    let text2 = "short";

    let result = longest(&text1, text2);
    println!("Longest string slice: '{}'", result);
}

// Function with generic lifetime annotation 'a
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
