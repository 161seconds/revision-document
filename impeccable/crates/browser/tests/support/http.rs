//! A local HTTP/1.1 server for browser tests.
//!
//! Chrome does not open exactly one connection per request. A backup connect
//! job, a preconnect, or the tab-icon fetch can each open a socket the test did
//! not plan for, and on a loaded machine (the Windows runner) they arrive in
//! any order. A server that accepts once, or answers connections one at a time,
//! then serves an idle socket while the real request waits, and the browser
//! reports an aborted or refused connection. This one answers every
//! connection on its own thread, ignores sockets that close without a request,
//! and returns 404 for paths the handler does not know.
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::Arc;
use std::time::Duration;

/// What a handler returns for a path: a content type and the body bytes.
pub type Response = (&'static str, Vec<u8>);

/// Serve `handler` on 127.0.0.1 for the rest of the test process and return the
/// origin (`http://127.0.0.1:<port>`). `handler` receives the request path.
pub fn serve<F>(handler: F) -> String
where
    F: Fn(&str) -> Option<Response> + Send + Sync + 'static,
{
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind test server");
    let origin = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
    let handler = Arc::new(handler);
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            let handler = handler.clone();
            std::thread::spawn(move || {
                let _ = respond(stream, &*handler);
            });
        }
    });
    origin
}

fn respond(mut stream: TcpStream, handler: &dyn Fn(&str) -> Option<Response>) -> std::io::Result<()> {
    stream.set_read_timeout(Some(Duration::from_secs(60)))?;
    let mut request = Vec::new();
    let mut buf = [0u8; 4096];
    while !request.windows(4).any(|w| w == b"\r\n\r\n") {
        let n = stream.read(&mut buf)?;
        if n == 0 {
            // A speculative socket the browser closed unused.
            return Ok(());
        }
        request.extend_from_slice(&buf[..n]);
        if request.len() > 64 * 1024 {
            return Ok(());
        }
    }
    let line = String::from_utf8_lossy(&request);
    let path = line.split_whitespace().nth(1).unwrap_or("/").to_string();
    let (status, kind, body) = match handler(&path) {
        Some((kind, body)) => ("200 OK", kind, body),
        None => ("404 Not Found", "text/plain", b"not found".to_vec()),
    };
    write!(
        stream,
        "HTTP/1.1 {status}\r\nContent-Type: {kind}\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(&body)?;
    stream.flush()
}
