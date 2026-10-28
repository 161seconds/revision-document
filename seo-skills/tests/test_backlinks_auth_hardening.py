"""Token-file hardening regressions for backlinks_auth.py (issue #290).

backlinks_auth.py previously had no write path and no permission handling
at all for ~/.config/claude-seo/backlinks-api.json. It now shares
google_auth._chmod_quiet and mirrors google_auth's os.open + fchmod write
pattern, plus a best-effort Windows icacls restriction: POSIX chmod/fchmod
mode bits are a no-op on Windows (NTFS is ACL-based), so without icacls the
"hardening" does nothing there.
"""

from __future__ import annotations

import json
import os
import stat
import sys

import pytest

_SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts")
if _SCRIPTS not in sys.path:
    sys.path.insert(0, _SCRIPTS)

# backlinks_auth.py unconditionally imports url_safety, which itself hard-requires
# requests (by design: no SSRF checks is worse than none). Skip cleanly rather
# than aborting collection when requests is not installed.
pytest.importorskip("requests")
import backlinks_auth  # noqa: E402


def _mode(path: str) -> int:
    return stat.S_IMODE(os.stat(path).st_mode)


@pytest.mark.skipif(
    os.name != "posix", reason="asserts 0o600 mode bits, which Windows does not represent"
)
def test_save_config_writes_with_0600_mode_bits(tmp_path, monkeypatch):
    config_path = tmp_path / "backlinks-api.json"
    monkeypatch.setattr(backlinks_auth, "CONFIG_PATH", str(config_path))

    backlinks_auth.save_config({"moz_api_key": "mozscape-xxxx"})

    assert config_path.exists()
    assert _mode(str(config_path)) == 0o600
    assert json.loads(config_path.read_text())["moz_api_key"] == "mozscape-xxxx"


@pytest.mark.skipif(
    os.name != "posix", reason="asserts 0o600 mode bits, which Windows does not represent"
)
def test_save_config_forces_0600_even_if_file_preexisted_world_readable(tmp_path, monkeypatch):
    config_path = tmp_path / "backlinks-api.json"
    config_path.write_text(json.dumps({"moz_api_key": "old"}))
    os.chmod(config_path, 0o644)
    monkeypatch.setattr(backlinks_auth, "CONFIG_PATH", str(config_path))

    backlinks_auth.save_config({"moz_api_key": "new"})

    assert _mode(str(config_path)) == 0o600


@pytest.mark.skipif(
    os.name != "posix", reason="asserts 0o600 mode bits, which Windows does not represent"
)
def test_load_config_remediates_legacy_world_readable_file(tmp_path, monkeypatch):
    config_path = tmp_path / "backlinks-api.json"
    config_path.write_text(json.dumps({"moz_api_key": "legacy"}))
    os.chmod(config_path, 0o644)
    monkeypatch.setattr(backlinks_auth, "CONFIG_PATH", str(config_path))
    monkeypatch.setattr(backlinks_auth, "CACHE_DIR", str(tmp_path / "cache"))

    config = backlinks_auth.load_config()

    assert config["moz_api_key"] == "legacy"
    assert _mode(str(config_path)) == 0o600


def test_write_secure_json_creates_missing_parent_directory(tmp_path):
    nested_path = tmp_path / "nested" / "dir" / "backlinks-api.json"

    backlinks_auth._write_secure_json(str(nested_path), {"moz_api_key": "x"})

    assert nested_path.exists()
    assert json.loads(nested_path.read_text())["moz_api_key"] == "x"


def test_restrict_to_current_user_windows_is_a_noop_on_posix(monkeypatch):
    """On the platform this suite normally runs on, the Windows branch must not fire."""
    calls = []
    monkeypatch.setattr(backlinks_auth.subprocess, "run", lambda *a, **kw: calls.append((a, kw)))
    monkeypatch.setattr(backlinks_auth.os, "name", "posix")

    backlinks_auth._restrict_to_current_user_windows("/tmp/whatever.json")

    assert calls == []


def test_windows_branch_invokes_icacls_with_current_user(monkeypatch):
    calls = []

    def fake_run(cmd, **kwargs):
        calls.append(cmd)

        class _Result:
            returncode = 0

        return _Result()

    monkeypatch.setattr(backlinks_auth.os, "name", "nt")
    monkeypatch.setenv("USERNAME", "test-user")
    monkeypatch.setattr(backlinks_auth.subprocess, "run", fake_run)

    backlinks_auth._restrict_to_current_user_windows(r"C:\Users\test-user\.config\backlinks-api.json")

    assert len(calls) == 1
    cmd = calls[0]
    assert cmd[0] == "icacls"
    assert r"C:\Users\test-user\.config\backlinks-api.json" in cmd
    assert any("test-user:F" in part for part in cmd)


def test_windows_branch_swallows_subprocess_failure_with_warning(monkeypatch, capsys):
    monkeypatch.setenv("USERNAME", "test-user")
    def raising_run(*args, **kwargs):
        raise FileNotFoundError("icacls not found")

    monkeypatch.setattr(backlinks_auth.os, "name", "nt")
    monkeypatch.setattr(backlinks_auth.subprocess, "run", raising_run)

    # Must not raise: a failed icacls call degrades to a warning, it never
    # aborts the credential write/load.
    backlinks_auth._restrict_to_current_user_windows(r"C:\Users\test-user\.claude-seo.json")

    captured = capsys.readouterr()
    assert "Warning" in captured.err
    assert "icacls" in captured.err


def test_save_config_calls_windows_restriction_when_os_name_is_nt(tmp_path, monkeypatch):
    """save_config() must reach the Windows hardening step (stubbed) on 'nt'."""
    config_path = tmp_path / "backlinks-api.json"
    monkeypatch.setattr(backlinks_auth, "CONFIG_PATH", str(config_path))
    monkeypatch.setattr(backlinks_auth.os, "name", "nt")

    calls = []
    monkeypatch.setattr(
        backlinks_auth,
        "_restrict_to_current_user_windows",
        lambda path: calls.append(path),
    )

    backlinks_auth.save_config({"moz_api_key": "x"})

    assert calls == [str(config_path)]


def test_windows_branch_skips_icacls_when_username_is_empty(monkeypatch, capsys):
    monkeypatch.setattr(backlinks_auth.os, "name", "nt")
    monkeypatch.delenv("USERNAME", raising=False)
    called = []
    monkeypatch.setattr(backlinks_auth.subprocess, "run", lambda *a, **k: called.append(a))
    backlinks_auth._restrict_to_current_user_windows(r"C:\Users\x\.claude-seo.json")
    assert not called, "icacls must not run with an empty grantee"
    assert "USERNAME is not set" in capsys.readouterr().err
