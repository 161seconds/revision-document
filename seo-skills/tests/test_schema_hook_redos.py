"""The JSON-LD hook must not hang on adversarial script tags (v2.3.0 review)."""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

HOOK = Path(__file__).resolve().parents[1] / "hooks" / "validate-schema.py"


def test_unclosed_script_tag_with_many_apostrophes_finishes_quickly(tmp_path: Path) -> None:
    # A tag with many apostrophes and no closing </script> made the attribute
    # tokenizer backtrack exponentially before the fallback class excluded quotes.
    page = tmp_path / "partial.php"
    page.write_text("<html><body>\n<script " + ("'" * 80) + " type=\"application/ld+json\"\n", encoding="utf-8")
    started = time.monotonic()
    result = subprocess.run(
        [sys.executable, str(HOOK), str(page)],
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=20,
    )
    assert time.monotonic() - started < 5, "hook took too long: possible catastrophic backtracking"
    assert result.returncode in (0, 1, 2)
