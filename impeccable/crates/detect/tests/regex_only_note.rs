//! A non-HTML file only gets the regex engine, so text mode says the scan
//! was an undercount, even when it found nothing (#884), names the file
//! types, and spells the URL scan that runs every rule. `--json` and
//! `--quiet` stay silent.

use std::collections::HashMap;

use impeccable_common::Io;
use impeccable_detect::cli::run_detect;
use impeccable_core::findings::Finding;
use impeccable_detect::engines::EngineError;
use impeccable_detect::{Engines, HtmlEngine, MissingHtmlEngine, ScanOptions};

const RULES: &str = "Rules that need a parsed page (tiny-text, low-contrast and other element rules) did not run on them; findings are an undercount, not a clean bill of health.\n";
/// No framework config in the scanned directory, so no port to spell.
const NO_PORT: &str = "For the full check, scan the running dev server (npx impeccable detect http://localhost:PORT) or a static site's built .html.\n";
const ASTRO_OPT_IN: &str = ".astro files can take the HTML engine instead: add { \"ext\": \".astro\", \"engine\": \"html\" } under detector.extensions in .impeccable/config.json (trades the regex rules and line numbers for the element rules).\n";

fn run(dir: &std::path::Path, flags: &[&str]) -> (i32, String, String) {
    let mut args: Vec<String> = ["--no-config", "--no-design-system"]
        .iter()
        .chain(flags)
        .map(|s| s.to_string())
        .collect();
    args.push(dir.to_string_lossy().into_owned());
    let (mut io, cap) = Io::captured("", dir.to_path_buf(), HashMap::new());
    let engines = Engines {
        html: &MissingHtmlEngine,
        url: None,
    };
    let code = run_detect(&args, &mut io, &engines);
    let out = String::from_utf8(cap.stdout.borrow().clone()).unwrap();
    let err = String::from_utf8(cap.stderr.borrow().clone()).unwrap();
    (code, out, err)
}

#[test]
fn zero_finding_source_scan_says_it_was_regex_only() {
    let dir = std::env::temp_dir().join(format!("impeccable-regex-note-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(
        dir.join("a.astro"),
        "<p style=\"font-size:8px\">tiny label</p>\n",
    )
    .unwrap();
    std::fs::write(dir.join("b.jsx"), "export const B = () => <p>ok</p>;\n").unwrap();

    // Extensions are listed sorted; the opt-in names only the HTML-like one.
    assert_eq!(
        run(&dir, &[]),
        (
            0,
            String::new(),
            format!("\n2 files scanned with regex matching only (.astro, .jsx).\n{RULES}{NO_PORT}{ASTRO_OPT_IN}")
        )
    );
    assert_eq!(
        run(&dir, &["--json"]),
        (0, "[]\n".to_string(), String::new())
    );
    assert_eq!(run(&dir, &["--quiet"]), (0, String::new(), String::new()));

    std::fs::remove_file(dir.join("b.jsx")).unwrap();
    assert_eq!(
        run(&dir, &[]).2,
        format!("\n1 file scanned with regex matching only (.astro).\n{RULES}{NO_PORT}{ASTRO_OPT_IN}")
    );

    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn framework_directory_spells_the_dev_server_scan() {
    let dir = std::env::temp_dir().join(format!("impeccable-regex-note-fw-{}", std::process::id()));
    std::fs::create_dir_all(dir.join("src")).unwrap();
    std::fs::write(dir.join("vite.config.js"), "export default {};\n").unwrap();
    std::fs::write(
        dir.join("src/App.tsx"),
        "export const App = () => <p style={{ fontSize: 8 }}>tiny</p>;\n",
    )
    .unwrap();

    // The dev-server nudge ahead of the note depends on whether something
    // listens on 5173 on this machine; the note itself does not.
    let (code, _, err) = run(&dir, &[]);
    assert_eq!(code, 0);
    assert!(
        err.ends_with(&format!(
            "\n2 files scanned with regex matching only (.js, .tsx).\n{RULES}For the full check, scan the running app:\n  npx impeccable detect http://localhost:5173\n"
        )),
        "stderr was: {err:?}"
    );

    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn two_framework_directories_get_one_url_each() {
    let root = std::env::temp_dir().join(format!("impeccable-regex-note-two-{}", std::process::id()));
    let vite = root.join("vite-app");
    let next = root.join("next-app");
    std::fs::create_dir_all(&vite).unwrap();
    std::fs::create_dir_all(&next).unwrap();
    std::fs::write(vite.join("vite.config.js"), "export default {};\n").unwrap();
    std::fs::write(vite.join("App.tsx"), "export const App = () => <p>vite</p>;\n").unwrap();
    std::fs::write(next.join("next.config.js"), "module.exports = {};\n").unwrap();
    std::fs::write(next.join("page.tsx"), "export default () => <p>next</p>;\n").unwrap();

    let args: Vec<String> = ["--no-config", "--no-design-system"]
        .iter()
        .map(|s| s.to_string())
        .chain([vite, next].iter().map(|d| d.to_string_lossy().into_owned()))
        .collect();
    let (mut io, cap) = Io::captured("", root.clone(), HashMap::new());
    let engines = Engines {
        html: &MissingHtmlEngine,
        url: None,
    };
    assert_eq!(run_detect(&args, &mut io, &engines), 0);
    let err = String::from_utf8(cap.stderr.borrow().clone()).unwrap();
    // Ports are listed in ascending order, whichever directory came first.
    assert!(
        err.ends_with(&format!(
            "\n4 files scanned with regex matching only (.js, .tsx).\n{RULES}For the full check, scan each running app:\n  npx impeccable detect http://localhost:3000\n  npx impeccable detect http://localhost:5173\n"
        )),
        "stderr was: {err:?}"
    );

    std::fs::remove_dir_all(&root).unwrap();
}

/// Stands in for the static HTML engine: finds nothing, so the test sees only
/// the routing decision.
struct CleanHtmlEngine;

impl HtmlEngine for CleanHtmlEngine {
    fn detect_html(
        &self,
        _path: &str,
        _options: &ScanOptions,
        _stderr: &mut dyn std::io::Write,
    ) -> Result<Vec<Finding>, EngineError> {
        Ok(Vec::new())
    }
}

#[test]
fn configured_html_engine_extension_is_not_counted() {
    let dir = std::env::temp_dir().join(format!("impeccable-regex-note-ext-{}", std::process::id()));
    std::fs::create_dir_all(dir.join(".impeccable")).unwrap();
    std::fs::write(
        dir.join(".impeccable/config.json"),
        r#"{ "detector": { "extensions": [{ "ext": ".html.erb", "engine": "html" }, ".liquid"], "designSystem": { "enabled": false } } }"#,
    )
    .unwrap();
    std::fs::write(dir.join("page.html.erb"), "<p><%= title %></p>\n").unwrap();
    std::fs::write(dir.join("b.jsx"), "export const B = () => <p>ok</p>;\n").unwrap();

    let run_cfg = |dir: &std::path::Path| {
        let args = vec![dir.to_string_lossy().into_owned()];
        let (mut io, cap) = Io::captured("", dir.to_path_buf(), HashMap::new());
        let engines = Engines {
            html: &CleanHtmlEngine,
            url: None,
        };
        let code = run_detect(&args, &mut io, &engines);
        let err = String::from_utf8(cap.stderr.borrow().clone()).unwrap();
        (code, err)
    };

    // The .html.erb file goes to the HTML engine; only b.jsx is regex-only,
    // and JSX gets no opt-in line.
    assert_eq!(
        run_cfg(&dir),
        (0, format!("\n1 file scanned with regex matching only (.jsx).\n{RULES}{NO_PORT}"))
    );

    // A bare-string entry also means the HTML engine.
    std::fs::remove_file(dir.join("b.jsx")).unwrap();
    std::fs::write(dir.join("t.liquid"), "<p>{{ title }}</p>\n").unwrap();
    assert_eq!(run_cfg(&dir), (0, String::new()));

    std::fs::remove_dir_all(&dir).unwrap();
}
