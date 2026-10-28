"""Layout contract for the claude.ai-hosted marketplace.

Hosted marketplace sync rejects any plugin that ships a top-level ``bin/``
directory (``marketplace_sync_bin_directory_not_allowed``). The launcher
therefore lives in ``scripts/`` beside ``runtime.py``, and every skill, agent,
and doc invokes it through the documented plugin-relative variable:

    "${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run <script.py>

Claude Code substitutes ``${CLAUDE_PLUGIN_ROOT}`` in skill body content and in
``allowed-tools`` Bash rules, and exports it to hook processes. The quoting
keeps the command correct when the plugin root contains spaces. Manual
installers rewrite that exact token to the absolute installed path.
"""

from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
LAUNCHER = ROOT / "scripts" / "claude-seo"
CANONICAL = '"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo"'
MANUAL = '"$HOME/.claude/skills/seo/scripts/claude-seo"'

# A bare invocation is ``claude-seo run`` with nothing in front of it. The
# repository-relative form ``./scripts/claude-seo run`` and the canonical form
# (which puts a closing quote between the name and the subcommand) do not match.
BARE_INVOCATION = re.compile(r"(?<![A-Za-z0-9_/])claude-seo (?:run|setup|doctor)\b")

# CHANGELOG.md records the historical bare form in released entries and must
# keep reading as written.
DOC_EXCLUSIONS = {"CHANGELOG.md"}


def _tracked() -> list[str]:
    out = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    return out.splitlines()


def _instruction_docs() -> list[str]:
    docs = []
    for rel in _tracked():
        if not rel.endswith(".md") or rel in DOC_EXCLUSIONS:
            continue
        if rel.startswith(("research/", ".github/", "tests/")):
            continue
        if rel.startswith(("skills/", "agents/", "docs/", "extensions/")) or "/" not in rel:
            docs.append(rel)
    return docs


def test_no_top_level_bin_directory() -> None:
    assert not (ROOT / "bin").exists(), (
        "a top-level bin/ directory makes hosted marketplace sync fail with "
        "marketplace_sync_bin_directory_not_allowed"
    )
    assert not any(rel == "bin" or rel.startswith("bin/") for rel in _tracked())


def test_launcher_lives_in_scripts_and_is_executable() -> None:
    assert LAUNCHER.is_file()
    if os.name == "posix":
        # The executable bit is a POSIX mode bit; Windows checkouts have none.
        assert LAUNCHER.stat().st_mode & 0o111, "the launcher must stay executable"
    text = LAUNCHER.read_text(encoding="utf-8")
    assert 'runtime="${launcher_dir}/runtime.py"' in text, (
        "the launcher must resolve runtime.py as a sibling"
    )
    assert "/../scripts/" not in text


def test_no_instruction_file_keeps_a_bare_launcher_invocation() -> None:
    offenders = []
    for rel in _instruction_docs():
        for match in BARE_INVOCATION.finditer((ROOT / rel).read_text(encoding="utf-8")):
            offenders.append(f"{rel}: {match.group(0)}")
    assert not offenders, "bare launcher invocations found: " + "; ".join(offenders)


def test_instruction_files_use_the_canonical_plugin_root_form() -> None:
    carriers = [
        rel
        for rel in _instruction_docs()
        if CANONICAL in (ROOT / rel).read_text(encoding="utf-8")
    ]
    assert len(carriers) > 30, "the canonical launcher form should be used repo-wide"
    assert "skills/seo/SKILL.md" in carriers
    assert "agents/seo-technical.md" in carriers


def test_installers_reference_the_scripts_launcher() -> None:
    unix = (ROOT / "install.sh").read_text(encoding="utf-8")
    assert 'cp "${TEMP_DIR}/claude-seo/scripts/claude-seo" "${SKILL_DIR}/scripts/claude-seo"' in unix
    assert 'chmod +x "${SKILL_DIR}/scripts/claude-seo"' in unix
    assert '"${SKILL_DIR}/scripts/claude-seo" setup' in unix
    for subcommand in ("run", "setup", "doctor"):
        assert f"s#{CANONICAL} {subcommand}#{MANUAL} {subcommand}#g" in unix
    assert "bin/claude-seo" not in unix

    windows = (ROOT / "install.ps1").read_text(encoding="utf-8")
    assert "Join-Path $ScriptsPath 'claude-seo'" in windows
    assert "Join-Path $SkillDir 'scripts'" in windows
    for subcommand in ("run", "setup", "doctor"):
        assert f"'{CANONICAL} {subcommand}'" in windows
        assert f"'{MANUAL} {subcommand}'" in windows
    assert "bin/claude-seo" not in windows


@pytest.mark.skipif(
    os.name != "posix",
    reason="the launcher is a bash script; Windows installs use install.ps1 and py -3, "
    "which the manual installer smoke workflow exercises",
)
def test_launcher_runs_without_network_or_managed_runtime() -> None:
    """``doctor --help`` is handled by argparse before any venv is touched."""
    # Python 3.14 argparse colourises help whenever colour is forced in the
    # environment; disable it and strip any escapes so the assertion is stable.
    env = {**os.environ, "PYTHON_COLORS": "0", "NO_COLOR": "1"}
    env.pop("FORCE_COLOR", None)
    result = subprocess.run(
        ["bash", str(LAUNCHER), "doctor", "--help"],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
        env=env,
    )
    assert result.returncode == 0, result.stderr
    plain = re.sub(r"\x1b\[[0-9;]*m", "", result.stdout)
    assert "usage: claude-seo doctor" in plain
