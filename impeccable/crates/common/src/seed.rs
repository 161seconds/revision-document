//! Seed keys and seed references.
//!
//! A roll key is what the roll API deals from and what the choice ping
//! names, so it must never be committed. Committed files (the surface brief,
//! the build state) carry a seed reference instead: `seed:` plus 16 hex of
//! SHA-256(`impeccable-seed:` + salt + `:` + key). The salt is 128 random
//! bits kept per user in `~/.impeccable/seed-salt`, so a reference cannot be
//! computed from a key by anyone without that file: holding the telemetry
//! dataset (which carries keys) is not enough to find a committed brief, and
//! a short key cannot be enumerated back from its reference. The flip side:
//! a reference resolves only on the machine (user) that made it. When no
//! salt can be persisted there is no reference at all (`salt` is `None`),
//! never an unsalted one. `IMPECCABLE_SEED_SALT` overrides the salt, for
//! reproducible tests.

use sha2::{Digest, Sha256};

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn is_hex(v: &str, len: usize) -> bool {
    v.len() == len && v.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

/// 128 bits from the OS CSPRNG as 32 lowercase hex. `None` only when the OS
/// generator fails.
pub fn random_hex32() -> Option<String> {
    let mut b = [0u8; 16];
    getrandom::getrandom(&mut b).ok()?;
    Some(hex(&b))
}

/// A new roll key: 32 lowercase hex from the OS CSPRNG (the roll API takes
/// `^[a-z0-9-]{1,64}$`). Falls back to a clock and pid mix only when the OS
/// generator fails, which it does not on any supported platform.
pub fn new_key() -> String {
    random_hex32().unwrap_or_else(|| {
        let t = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0);
        hex(&Sha256::digest(format!("{}:{}", t, std::process::id()).as_bytes())[..16])
    })
}

fn salt_places(home: &str, project: Option<&str>) -> Vec<std::path::PathBuf> {
    let mut places: Vec<std::path::PathBuf> = Vec::new();
    if !home.is_empty() {
        places.push(std::path::Path::new(home).join(".impeccable").join("seed-salt"));
    }
    if let Some(p) = project.filter(|p| !p.is_empty()) {
        places.push(std::path::Path::new(p).join(".impeccable").join("questions").join("seed-salt"));
    }
    places
}

/// A salt file's state: absent, present and valid, or present and not 32
/// lowercase hex.
enum Kept {
    Absent,
    Valid(String),
    Corrupt,
}

fn kept(file: &std::path::Path) -> Kept {
    match std::fs::read_to_string(file) {
        Ok(text) if is_hex(text.trim(), 32) => Kept::Valid(text.trim().to_string()),
        Ok(_) => Kept::Corrupt,
        Err(_) if file.exists() => Kept::Corrupt,
        Err(_) => Kept::Absent,
    }
}

/// Every valid salt this machine already keeps, home first then project
/// (or only the override). References made under any of them resolve.
pub fn existing_salts(home: &str, project: Option<&str>, override_salt: Option<&str>) -> Vec<String> {
    if let Some(s) = override_salt.filter(|s| !s.is_empty()) {
        return vec![s.to_string()];
    }
    let mut out: Vec<String> = Vec::new();
    for file in salt_places(home, project) {
        if let Kept::Valid(s) = kept(&file) {
            if !out.contains(&s) {
                out.push(s);
            }
        }
    }
    out
}

fn create(file: &std::path::Path) -> Option<String> {
    let fresh = random_hex32()?;
    let dir = file.parent()?.to_path_buf();
    std::fs::create_dir_all(&dir).ok()?;
    if file.to_string_lossy().contains("questions") {
        crate::git::ensure_dir_ignored(&dir.to_string_lossy(), &["*"]);
    }
    match std::fs::OpenOptions::new().write(true).create_new(true).open(file) {
        Ok(mut f) => {
            use std::io::Write;
            if f.write_all(format!("{}\n", fresh).as_bytes()).is_err() {
                let _ = std::fs::remove_file(file);
                return None;
            }
            Some(fresh)
        }
        // Another process created it first: use theirs.
        Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => match kept(file) {
            Kept::Valid(s) => Some(s),
            _ => None,
        },
        Err(_) => None,
    }
}

/// The salt new references are made under. `IMPECCABLE_SEED_SALT` wins
/// (reproducible tests). Otherwise an existing valid salt always wins over
/// making one, so a reference never stops resolving because a better place
/// became writable: the user's `<home>/.impeccable/seed-salt`, else the
/// project's `<project>/.impeccable/questions/seed-salt` (an ignored runtime
/// folder, for sandboxes whose home is read-only); only with neither is one
/// created, in the home first, then the project.
///
/// `None` when no valid salt can be had. A corrupt salt file is never
/// rewritten (that would orphan every reference made under it), and a
/// corrupt home salt is not replaced by a new project one; there is never an
/// unsalted fallback, since an unsalted reference is a public hash of the
/// key, linkable by anyone holding keys.
pub fn salt(home: &str, project: Option<&str>, override_salt: Option<&str>) -> Option<String> {
    if let Some(s) = override_salt.filter(|s| !s.is_empty()) {
        return Some(s.to_string());
    }
    if let Some(s) = existing_salts(home, project, None).into_iter().next() {
        return Some(s);
    }
    let places = salt_places(home, project);
    let mut home_corrupt = false;
    for (i, file) in places.iter().enumerate() {
        match kept(file) {
            Kept::Valid(s) => return Some(s),
            Kept::Corrupt => {
                if i == 0 && !home.is_empty() {
                    home_corrupt = true;
                }
                continue;
            }
            Kept::Absent => {
                if home_corrupt {
                    return None;
                }
                if let Some(s) = create(file) {
                    return Some(s);
                }
            }
        }
    }
    None
}

/// The 16 hex of a key's reference under `salt`.
pub fn tag(salt: &str, key: &str) -> String {
    hex(&Sha256::digest(format!("impeccable-seed:{}:{}", salt, key).as_bytes())[..8])
}

/// `seed:<tag>`.
pub fn reference(salt: &str, key: &str) -> String {
    format!("seed:{}", tag(salt, key))
}

/// The 16 hex of a `seed:<16 lowercase hex>` reference, else `None`.
pub fn parse_reference(v: &str) -> Option<&str> {
    v.strip_prefix("seed:").filter(|h| is_hex(h, 16))
}

// ---- the seed ledger locator ---------------------------------------------------

/// The salt name a ledger made with no salt at all is filed under. Such a
/// ledger is marked `"unsalted": true` and never yields a reference.
pub const NO_SALT: &str = "no-salt:local-ledger-name";

/// `<project>/.impeccable/questions/seeds`: one ledger file per seed key,
/// named by the key's reference tag and holding the key itself.
pub fn seeds_dir(project: &str) -> std::path::PathBuf {
    std::path::Path::new(project).join(".impeccable").join("questions").join("seeds")
}

/// A key's ledger as the locator found it.
#[derive(Clone, Debug, PartialEq)]
pub struct Located {
    /// Where the key's ledger lives (or will, when `exists` is false).
    pub path: std::path::PathBuf,
    pub exists: bool,
    /// The key's seed reference: the existing ledger's own name, or for a
    /// new key the primary salt's tag. `None` for an unsalted ledger, or a
    /// new key on a machine with no salt.
    pub reference: Option<String>,
}

fn ledger_key(path: &std::path::Path) -> Option<(String, bool)> {
    let v: serde_json::Value = serde_json::from_str(&std::fs::read_to_string(path).ok()?).ok()?;
    let key = v.get("key")?.as_str()?.to_string();
    Some((key, v.get("unsalted").and_then(|u| u.as_bool()) == Some(true)))
}

/// The one rule that ties a key to its salt: a key's salt is chosen once,
/// when its ledger is first written, and everything else (the printed SEED
/// REFERENCE, the roll record's seed, the ledger file, `--from`,
/// `--check-seed`, build-phase's `--direction`) derives from that file.
///
/// An existing ledger for `key` wins, wherever it is: first the key's names
/// under `primary` and every `kept` salt (cheap), then a scan of the folder
/// (a ledger made under a salt this machine no longer has, such as a home
/// salt now out of reach). Its reference is its own file name. Only a key
/// with no ledger takes `primary`; with no salt at all it gets an unsalted
/// file and no reference.
pub fn locate(project: &str, primary: Option<&str>, kept: &[String], key: &str) -> Located {
    let dir = seeds_dir(project);
    let found = |path: std::path::PathBuf| -> Option<Located> {
        let (k, unsalted) = ledger_key(&path)?;
        if k != key {
            return None;
        }
        let stem = path.file_stem()?.to_string_lossy().into_owned();
        // Unsalted when marked so, or when named by the no-salt tag (ledgers
        // written before the marker existed): such a name is a public hash
        // of the key, so it never becomes a reference.
        let unsalted = unsalted || stem == tag(NO_SALT, key);
        let reference = (!unsalted && is_hex(&stem, 16)).then(|| format!("seed:{}", stem));
        Some(Located { path, exists: true, reference })
    };
    let mut names: Vec<&str> = primary.into_iter().collect();
    for s in kept {
        if !names.contains(&s.as_str()) {
            names.push(s);
        }
    }
    names.push(NO_SALT);
    for s in &names {
        if let Some(l) = found(dir.join(format!("{}.json", tag(s, key)))) {
            return l;
        }
    }
    if let Ok(entries) = std::fs::read_dir(&dir) {
        let mut paths: Vec<std::path::PathBuf> = entries.flatten().map(|e| e.path()).filter(|p| p.extension().is_some_and(|x| x == "json")).collect();
        paths.sort();
        for p in paths {
            if let Some(l) = found(p) {
                return l;
            }
        }
    }
    match primary {
        Some(s) => Located { path: dir.join(format!("{}.json", tag(s, key))), exists: false, reference: Some(reference(s, key)) },
        None => Located { path: dir.join(format!("{}.json", tag(NO_SALT, key))), exists: false, reference: None },
    }
}

/// `locate` for a key the engine has just generated: 128 random bits have no
/// ledger anywhere, so there is nothing to search; the key takes the primary
/// salt (or, with none, an unsalted file and no reference).
pub fn locate_fresh(project: &str, primary: Option<&str>, key: &str) -> Located {
    let dir = seeds_dir(project);
    match primary {
        Some(s) => {
            let path = dir.join(format!("{}.json", tag(s, key)));
            Located { exists: path.exists(), path, reference: Some(reference(s, key)) }
        }
        None => {
            let path = dir.join(format!("{}.json", tag(NO_SALT, key)));
            Located { exists: path.exists(), path, reference: None }
        }
    }
}

/// The key a seed reference names on this machine: its ledger file, named
/// by the reference itself, and the key recorded in it. `None` when there
/// is no such ledger, or it is unsalted.
pub fn resolve(project: &str, reference: &str) -> Option<String> {
    let t = parse_reference(reference)?;
    match ledger_key(&seeds_dir(project).join(format!("{}.json", t)))? {
        (k, false) if t != tag(NO_SALT, &k) => Some(k),
        _ => None,
    }
}

/// A key's seed reference for a command that does not write the ledger
/// (build-phase): the locator's answer, under this machine's salts.
pub fn reference_for_key(home: &str, project: &str, override_salt: Option<&str>, key: &str) -> Option<String> {
    let primary = salt(home, Some(project), override_salt);
    let kept = existing_salts(home, Some(project), override_salt);
    locate(project, primary.as_deref(), &kept, key).reference
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keys_are_128_bit_hex_and_references_depend_on_the_salt() {
        let a = new_key();
        assert!(is_hex(&a, 32) && a != new_key(), "{a}");
        let r = reference("s1", "k1");
        assert_eq!(r, reference("s1", "k1"));
        assert_ne!(r, reference("s2", "k1"), "a dataset holder without the salt cannot compute it");
        assert_eq!(parse_reference(&r).map(str::len), Some(16));
        assert_eq!(parse_reference("seed:ABCDEF0123456789"), None);
    }

    fn temp(name: &str) -> std::path::PathBuf {
        let d = std::env::temp_dir().join(format!("impeccable-salt-{}-{}", name, std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn the_salt_is_created_once_per_home_and_can_be_pinned() {
        let home = temp("home");
        let h = home.to_string_lossy().into_owned();
        let first = salt(&h, None, None).unwrap();
        assert!(is_hex(&first, 32), "{first}");
        assert_eq!(salt(&h, None, None).unwrap(), first, "stable");
        assert_eq!(salt(&h, None, Some("pinned")).unwrap(), "pinned");
        assert_eq!(salt("", None, None), None, "no place, no salt");
        let _ = std::fs::remove_dir_all(&home);
    }

    #[test]
    fn a_corrupt_salt_is_never_replaced_or_bypassed() {
        let home = temp("corrupt");
        let project = temp("corrupt-project");
        std::fs::create_dir_all(home.join(".impeccable")).unwrap();
        std::fs::write(home.join(".impeccable/seed-salt"), "not a salt\n").unwrap();
        assert_eq!(salt(&home.to_string_lossy(), Some(&project.to_string_lossy()), None), None);
        assert_eq!(std::fs::read_to_string(home.join(".impeccable/seed-salt")).unwrap(), "not a salt\n", "left for the user");
        assert!(!project.join(".impeccable/questions/seed-salt").exists(), "no silent switch to another salt");
    }

    #[cfg(unix)]
    #[test]
    fn an_unwritable_home_falls_back_to_the_project_and_then_to_nothing() {
        use std::os::unix::fs::PermissionsExt;
        let home = temp("readonly");
        let project = temp("readonly-project");
        std::fs::set_permissions(&home, std::fs::Permissions::from_mode(0o555)).unwrap();
        if std::fs::write(home.join("probe"), "").is_ok() {
            return; // running as root: permissions are not enforced
        }
        let p = salt(&home.to_string_lossy(), Some(&project.to_string_lossy()), None).unwrap();
        assert_eq!(std::fs::read_to_string(project.join(".impeccable/questions/seed-salt")).unwrap().trim(), p);
        assert!(std::fs::read_to_string(project.join(".impeccable/questions/.gitignore")).unwrap().ends_with("*\n"));
        std::fs::set_permissions(&project, std::fs::Permissions::from_mode(0o555)).unwrap();
        let other = temp("readonly-project-2");
        std::fs::set_permissions(&other, std::fs::Permissions::from_mode(0o555)).unwrap();
        assert_eq!(salt(&home.to_string_lossy(), Some(&other.to_string_lossy()), None), None, "nowhere to keep one");
        for d in [&home, &project, &other] {
            let _ = std::fs::set_permissions(d, std::fs::Permissions::from_mode(0o755));
            let _ = std::fs::remove_dir_all(d);
        }
    }

    #[test]
    fn a_project_salt_keeps_winning_once_the_home_becomes_writable() {
        let home = temp("later-home");
        let project = temp("later-project");
        let (h, p) = (home.to_string_lossy().into_owned(), project.to_string_lossy().into_owned());
        // A sandboxed run with no usable home made the project salt.
        let first = salt("", Some(&p), None).unwrap();
        assert!(project.join(".impeccable/questions/seed-salt").exists());
        // Later the home is writable: the existing salt still wins, no new one is made.
        assert_eq!(salt(&h, Some(&p), None).unwrap(), first);
        assert!(!home.join(".impeccable/seed-salt").exists());
        assert_eq!(existing_salts(&h, Some(&p), None), vec![first]);
    }

    #[test]
    fn a_home_salt_wins_and_a_stray_project_salt_still_counts() {
        let home = temp("both-home");
        let project = temp("both-project");
        let (h, p) = (home.to_string_lossy().into_owned(), project.to_string_lossy().into_owned());
        let project_salt = salt("", Some(&p), None).unwrap();
        std::fs::create_dir_all(home.join(".impeccable")).unwrap();
        std::fs::write(home.join(".impeccable/seed-salt"), "0123456789abcdef0123456789abcdef\n").unwrap();
        assert_eq!(salt(&h, Some(&p), None).unwrap(), "0123456789abcdef0123456789abcdef");
        assert_eq!(existing_salts(&h, Some(&p), None), vec!["0123456789abcdef0123456789abcdef".to_string(), project_salt]);
    }

    #[test]
    fn a_legacy_no_salt_ledger_never_yields_a_reference() {
        let project = temp("legacy-nosalt");
        let p = project.to_string_lossy().into_owned();
        let dir = seeds_dir(&p);
        std::fs::create_dir_all(&dir).unwrap();
        // Written by an earlier build: the no-salt name, no "unsalted" marker.
        let legacy = dir.join(format!("{}.json", tag(NO_SALT, "k1")));
        std::fs::write(&legacy, r#"{"key":"k1"}"#).unwrap();
        let l = locate(&p, Some("salt"), &["salt".to_string()], "k1");
        assert_eq!((l.exists, l.reference), (true, None), "found, but no committable reference");
        assert_eq!(resolve(&p, &format!("seed:{}", tag(NO_SALT, "k1"))), None);
        // A fresh key skips the search and takes the primary salt.
        let f = locate_fresh(&p, Some("salt"), "k2");
        assert_eq!((f.exists, f.reference), (false, Some(reference("salt", "k2"))));
    }
}
