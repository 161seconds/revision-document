//! Filesystem helpers shared by the verb crates.

use std::path::{Path, PathBuf};

/// Replace `path` with `bytes` atomically: write a sibling temp file, then
/// rename it over the target, so a crash or a full disk never leaves a
/// truncated file behind. A symlinked target (a dotfiles checkout of
/// `~/.claude/settings.json`) is resolved first, so the link stays in place
/// and the file it points at is the one replaced. An existing file's
/// permissions carry over to the replacement.
pub fn write_atomic(path: impl AsRef<Path>, bytes: &[u8]) -> std::io::Result<()> {
    let path = path.as_ref();
    let target = resolve_write_target(path);
    let dir = match target.parent() {
        Some(d) if !d.as_os_str().is_empty() => d.to_path_buf(),
        _ => PathBuf::from("."),
    };
    let name = target
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "file".into());
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(0);
    let temp = dir.join(format!(".{name}.{}.{nanos}.tmp", std::process::id()));
    let result = (|| {
        // A dangling link can point into a directory that does not exist yet
        // (a first-time dotfiles checkout); callers only create the link's own
        // parent.
        std::fs::create_dir_all(&dir)?;
        std::fs::write(&temp, bytes)?;
        if let Ok(meta) = std::fs::metadata(&target) {
            let _ = std::fs::set_permissions(&temp, meta.permissions());
        }
        std::fs::rename(&temp, &target)
    })();
    if result.is_err() {
        let _ = std::fs::remove_file(&temp);
    }
    result
}

/// The file a write to `path` should land in. An existing target resolves
/// through `canonicalize`. A symlink whose destination does not exist yet
/// (a dotfiles link to a file not created) cannot be canonicalized, so its
/// chain is followed with `read_link`, each relative hop resolved against the
/// link's own directory, up to a bound that stops a cycle. Anything else is
/// written in place.
fn resolve_write_target(path: &Path) -> PathBuf {
    if let Ok(real) = std::fs::canonicalize(path) {
        return real;
    }
    const MAX_HOPS: usize = 40;
    let mut current = path.to_path_buf();
    for _ in 0..MAX_HOPS {
        let is_link = std::fs::symlink_metadata(&current)
            .map(|m| m.file_type().is_symlink())
            .unwrap_or(false);
        if !is_link {
            return current;
        }
        let Ok(next) = std::fs::read_link(&current) else {
            return current;
        };
        current = if next.is_absolute() {
            next
        } else {
            current.parent().map(|p| p.join(&next)).unwrap_or(next)
        };
    }
    // A cycle or an absurd chain: leave the link alone rather than guess.
    path.to_path_buf()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp(tag: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!(
            "impeccable-fsx-{tag}-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn writes_new_and_replaces_existing() {
        let d = tmp("replace");
        let f = d.join("a.json");
        write_atomic(&f, b"one").unwrap();
        write_atomic(&f, b"two").unwrap();
        assert_eq!(std::fs::read_to_string(&f).unwrap(), "two");
        let leftovers: Vec<_> = std::fs::read_dir(&d).unwrap().collect();
        assert_eq!(leftovers.len(), 1, "temp file left behind");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[cfg(unix)]
    #[test]
    fn keeps_a_symlinked_target_linked() {
        let d = tmp("symlink");
        let real = d.join("real.json");
        let link = d.join("link.json");
        std::fs::write(&real, b"old").unwrap();
        std::os::unix::fs::symlink(&real, &link).unwrap();
        write_atomic(&link, b"new").unwrap();
        assert!(std::fs::symlink_metadata(&link).unwrap().file_type().is_symlink());
        assert_eq!(std::fs::read_to_string(&real).unwrap(), "new");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[cfg(unix)]
    #[test]
    fn creates_the_destination_of_a_dangling_link_chain() {
        let d = tmp("dangling");
        std::fs::create_dir_all(d.join("dotfiles")).unwrap();
        let link = d.join("link.json");
        let hop = d.join("dotfiles/hop.json");
        // Relative hops: `link.json -> dotfiles/hop.json -> real.json`, the
        // second resolved against `dotfiles/`, and `real.json` not created yet.
        std::os::unix::fs::symlink("dotfiles/hop.json", &link).unwrap();
        std::os::unix::fs::symlink("real.json", &hop).unwrap();
        write_atomic(&link, b"new").unwrap();
        assert!(std::fs::symlink_metadata(&link).unwrap().file_type().is_symlink());
        assert!(std::fs::symlink_metadata(&hop).unwrap().file_type().is_symlink());
        assert_eq!(std::fs::read_to_string(d.join("dotfiles/real.json")).unwrap(), "new");
        assert_eq!(std::fs::read_to_string(&link).unwrap(), "new");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[cfg(unix)]
    #[test]
    fn creates_the_missing_directory_of_a_dangling_link() {
        let d = tmp("dangling-dir");
        let link = d.join("settings.json");
        // `settings.json -> dotfiles/claude/settings.json`, with `dotfiles/claude/` not created yet.
        std::os::unix::fs::symlink("dotfiles/claude/settings.json", &link).unwrap();
        write_atomic(&link, b"new").unwrap();
        assert!(std::fs::symlink_metadata(&link).unwrap().file_type().is_symlink());
        assert_eq!(std::fs::read_to_string(d.join("dotfiles/claude/settings.json")).unwrap(), "new");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[cfg(unix)]
    #[test]
    fn leaves_a_symlink_cycle_alone() {
        let d = tmp("cycle");
        let a = d.join("a.json");
        let b = d.join("b.json");
        std::os::unix::fs::symlink(&b, &a).unwrap();
        std::os::unix::fs::symlink(&a, &b).unwrap();
        // Replaces the link itself rather than looping forever.
        write_atomic(&a, b"x").unwrap();
        assert_eq!(std::fs::read_to_string(&a).unwrap(), "x");
        let _ = std::fs::remove_dir_all(&d);
    }
}
