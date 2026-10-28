"""Regression tests for setup_mcp.py's atomic ~/.claude.json write.

~/.claude.json is shared with Claude Code and other extension installers, so
save_settings() must never leave it truncated or half-written. It stages the
write to a temp file in the same directory and swaps it into place with
os.replace.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_module(monkeypatch, home: Path):
    """Import setup_mcp.py fresh with HOME pointed at an isolated directory.

    SETTINGS_PATH is computed at module-exec time from Path.home(), so HOME
    must be patched before exec_module runs.
    """
    monkeypatch.setenv("HOME", str(home))
    # Path.home() reads USERPROFILE on Windows, not HOME.
    monkeypatch.setenv("USERPROFILE", str(home))
    spec = importlib.util.spec_from_file_location(
        "banana_setup_mcp", REPO_ROOT / "extensions/banana/scripts/setup_mcp.py"
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_setup_mcp_writes_config_with_no_leftover_temp_file(tmp_path, monkeypatch):
    module = _load_module(monkeypatch, tmp_path)

    module.setup_mcp("dummy-api-key")

    settings_path = tmp_path / ".claude.json"
    assert settings_path.exists()
    data = json.loads(settings_path.read_text())
    assert data["mcpServers"]["nanobanana-mcp"]["env"]["GOOGLE_AI_API_KEY"] == "dummy-api-key"
    assert list(tmp_path.glob(".claude.json.*.tmp")) == []


def test_save_settings_preserves_unrelated_keys_on_existing_file(tmp_path, monkeypatch):
    (tmp_path / ".claude.json").write_text(
        json.dumps({"unrelated": "keep-me", "mcpServers": {"other-mcp": {"command": "x"}}})
    )
    module = _load_module(monkeypatch, tmp_path)

    module.setup_mcp("dummy-api-key")

    data = json.loads((tmp_path / ".claude.json").read_text())
    assert data["unrelated"] == "keep-me"
    assert "other-mcp" in data["mcpServers"]
    assert "nanobanana-mcp" in data["mcpServers"]


def test_save_settings_stages_temp_file_in_same_directory(tmp_path, monkeypatch):
    module = _load_module(monkeypatch, tmp_path)
    tmp_dirs_seen = []
    real_mkstemp = module.tempfile.mkstemp

    def spy_mkstemp(*args, **kwargs):
        fd, path = real_mkstemp(*args, **kwargs)
        tmp_dirs_seen.append(Path(path).parent)
        return fd, path

    monkeypatch.setattr(module.tempfile, "mkstemp", spy_mkstemp)

    module.save_settings({"mcpServers": {}})

    assert tmp_dirs_seen == [tmp_path]
    assert (tmp_path / ".claude.json").exists()


def test_save_settings_cleans_up_temp_file_and_leaves_original_on_failure(tmp_path, monkeypatch):
    original = {"mcpServers": {}, "keep": "value"}
    (tmp_path / ".claude.json").write_text(json.dumps(original))
    module = _load_module(monkeypatch, tmp_path)

    class Unserializable:
        pass

    with pytest.raises(TypeError):
        module.save_settings({"bad": Unserializable()})

    assert json.loads((tmp_path / ".claude.json").read_text()) == original
    assert list(tmp_path.glob(".claude.json.*.tmp")) == []
