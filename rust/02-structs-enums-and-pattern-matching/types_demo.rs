// rust/02-structs-enums-and-pattern-matching/types_demo.rs
//! Demonstrates Algebraic Data Types, Monadic Transformations, and Type-State Machines.

use std::marker::PhantomData;

// =========================================================================
// 1. Tagged Union Enum & Monadic Error Handling
// =========================================================================

#[derive(Debug, PartialEq, Eq)]
pub enum HttpMethod {
    Get,
    Post,
    Delete,
}

#[derive(Debug, PartialEq, Eq)]
pub enum RouteAction {
    ServeStatic(String),
    ExecuteHandler { endpoint: String, is_admin: bool },
    Unauthorized,
    NotFound,
}

pub struct HttpRequest {
    pub method: HttpMethod,
    pub path: String,
    pub auth_token: Option<String>,
}

impl HttpRequest {
    pub fn new(method: HttpMethod, path: &str, auth_token: Option<&str>) -> Self {
        Self {
            method,
            path: path.to_string(),
            auth_token: auth_token.map(|s| s.to_string()),
        }
    }

    pub fn dispatch(&self) -> RouteAction {
        match (&self.method, self.path.as_str()) {
            (HttpMethod::Get, path) if path.starts_with("/static/") => {
                RouteAction::ServeStatic(path.to_string())
            }
            (HttpMethod::Post, "/api/admin/deploy") => {
                // Monadic token check:
                let is_valid_admin = self.auth_token
                    .as_deref()
                    .filter(|token| token.starts_with("bearer-admin-"))
                    .is_some();

                if is_valid_admin {
                    RouteAction::ExecuteHandler {
                        endpoint: "/api/admin/deploy".to_string(),
                        is_admin: true,
                    }
                } else {
                    RouteAction::Unauthorized
                }
            }
            (HttpMethod::Get, endpoint @ ("/api/v1/health" | "/api/v1/metrics")) => {
                RouteAction::ExecuteHandler {
                    endpoint: endpoint.to_string(),
                    is_admin: false,
                }
            }
            _ => RouteAction::NotFound,
        }
    }
}

// =========================================================================
// 2. Compile-Time Type-State Pattern
// =========================================================================

pub struct Uninitialized;
pub struct Armed;
pub struct Fired;

pub struct RocketEngine<State> {
    fuel_level_percent: u8,
    thrust_kn: u32,
    _state: PhantomData<State>,
}

impl RocketEngine<Uninitialized> {
    pub fn new() -> Self {
        Self {
            fuel_level_percent: 100,
            thrust_kn: 0,
            _state: PhantomData,
        }
    }

    pub fn arm(self) -> Result<RocketEngine<Armed>, &'static str> {
        if self.fuel_level_percent < 50 {
            return Err("Insufficient propellant to arm engine");
        }
        Ok(RocketEngine {
            fuel_level_percent: self.fuel_level_percent,
            thrust_kn: 0,
            _state: PhantomData,
        })
    }
}

impl RocketEngine<Armed> {
    pub fn fire(mut self, target_thrust: u32) -> RocketEngine<Fired> {
        self.thrust_kn = target_thrust;
        self.fuel_level_percent = 0;
        RocketEngine {
            fuel_level_percent: 0,
            thrust_kn: target_thrust,
            _state: PhantomData,
        }
    }
}

impl RocketEngine<Fired> {
    pub fn report_telemetry(&self) -> (u8, u32) {
        (self.fuel_level_percent, self.thrust_kn)
    }
}

fn main() {
    println!("=== RUST TYPES, ENUMS & STATE MACHINES ===");

    let req = HttpRequest::new(HttpMethod::Get, "/api/v1/health", None);
    println!("Action dispatched: {:?}", req.dispatch());

    let rocket = RocketEngine::new();
    let armed = rocket.arm().expect("Failed to arm");
    let fired = armed.fire(3500);
    let (fuel, thrust) = fired.report_telemetry();
    println!("Fired rocket: Fuel = {}%, Thrust = {} kN", fuel, thrust);
}
