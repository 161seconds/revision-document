"""MCP agent permission and fail-closed regressions."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENTS = (
    ROOT / "agents" / "seo-dataforseo.md",
    ROOT / "extensions" / "dataforseo" / "agents" / "seo-dataforseo.md",
)


def _text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_dataforseo_agent_mirrors_allow_only_sanctioned_mcp_path():
    for path in AGENTS:
        text = _text(path)
        frontmatter = text.split("---", 2)[1]
        tools_line = next(line for line in frontmatter.splitlines() if line.startswith("tools:"))
        assert "mcp__dataforseo__*" in tools_line
        assert "Bash" not in tools_line


def test_dataforseo_agent_mirrors_fail_closed_without_mcp():
    required = (
        "fail closed",
        "Never inspect credential or",
        "never bypass MCP with curl, raw HTTP, or another client",
    )
    for path in AGENTS:
        text = _text(path)
        for phrase in required:
            assert phrase in text


def test_dataforseo_agent_bodies_stay_mirrored():
    public_body = _text(AGENTS[0]).split("---", 2)[2]
    extension_body = _text(AGENTS[1]).split("---", 2)[2]
    assert public_body == extension_body


def test_dataforseo_installers_use_matching_mcp_server_name():
    # install.sh still merges the entry with a Python dict subscript;
    # install.ps1 merges it natively with Add-Member (v2.3.1, atomic
    # ConvertTo-Json write). Either way the server must be registered as
    # exactly "dataforseo" to match the agents' `mcp__dataforseo__*` grant.
    assert "['dataforseo']" in _text(ROOT / "extensions/dataforseo/install.sh")
    assert "-NotePropertyName 'dataforseo'" in _text(ROOT / "extensions/dataforseo/install.ps1")
