// rust/03-generics-traits-and-types/traits_demo.rs
//! Demonstrates Generics, Traits, Associated Types, and Static vs Dynamic Dispatch.

use std::fmt::Display;
use std::ops::Deref;

// =========================================================================
// 1. Trait Definition & Associated Types
// =========================================================================

pub trait Codec {
    type Input;
    type Output;

    fn encode(&self, item: Self::Input) -> Self::Output;
    fn decode(&self, raw: Self::Output) -> Result<Self::Input, String>;
}

pub struct HexCodec;

impl Codec for HexCodec {
    type Input = Vec<u8>;
    type Output = String;

    fn encode(&self, bytes: Vec<u8>) -> String {
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }

    fn decode(&self, raw: String) -> Result<Vec<u8>, String> {
        if raw.len() % 2 != 0 {
            return Err("Hex string must have even length".to_string());
        }
        (0..raw.len())
            .step_by(2)
            .map(|i| {
                u8::from_str_radix(&raw[i..i + 2], 16)
                    .map_err(|e| format!("Invalid hex byte: {}", e))
            })
            .collect()
    }
}

// =========================================================================
// 2. Static vs Dynamic Dispatch
// =========================================================================

pub trait Renderer {
    fn render(&self) -> String;
}

pub struct TerminalRenderer;
impl Renderer for TerminalRenderer {
    fn render(&self) -> String { "[TERM] Render output".to_string() }
}

pub struct HtmlRenderer;
impl Renderer for HtmlRenderer {
    fn render(&self) -> String { "<div class='render'>Render output</div>".to_string() }
}

// Static Dispatch (Zero runtime cost, inlined monomorphization)
pub fn render_static(r: &impl Renderer) -> String {
    r.render()
}

// Dynamic Dispatch (Trait Object with fat pointer: data ptr + vtable ptr)
pub fn render_dynamic_pipeline(renderers: &[Box<dyn Renderer>]) -> Vec<String> {
    renderers.iter().map(|r| r.render()).collect()
}

// =========================================================================
// 3. Deref Coercion Smart Pointer
// =========================================================================

pub struct FastBuffer<T> {
    inner: Vec<T>,
}

impl<T> FastBuffer<T> {
    pub fn new(elements: Vec<T>) -> Self {
        Self { inner: elements }
    }
}

impl<T> Deref for FastBuffer<T> {
    type Target = [T];

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

fn inspect_slice<T: Display>(slice: &[T]) {
    for item in slice {
        print!("{} ", item);
    }
    println!();
}

fn main() {
    println!("=== RUST GENERICS & TRAITS DEMO ===");

    // Static dispatch
    let term = TerminalRenderer;
    println!("Static: {}", render_static(&term));

    // Dynamic dispatch via heterogeneous collection
    let pipeline: Vec<Box<dyn Renderer>> = vec![
        Box::new(TerminalRenderer),
        Box::new(HtmlRenderer),
    ];
    let outputs = render_dynamic_pipeline(&pipeline);
    for out in outputs {
        println!("Dynamic: {}", out);
    }

    // Deref coercion: FastBuffer<i32> automatically coerces to &[i32]
    let buf = FastBuffer::new(vec![10, 20, 30, 40]);
    inspect_slice(&buf);
}
