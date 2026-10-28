"""
Tests for case-insensitive `rel` detection in scripts/parse_html.py.

Background: `soup.find("link", rel="canonical")` and
`soup.find_all("link", rel="alternate")` compare bs4's parsed `rel` values
with an exact, lower-case string. The underlying HTML parser lower-cases tag
and attribute *names* (so `REL="..."` is read as the `rel` attribute), but it
preserves the attribute *value* verbatim, so `rel="Alternate"` or
`REL="Canonical"` never matched and both the canonical link and every
hreflang alternate using mixed-case `rel` were silently dropped.
"""
import sys
from pathlib import Path

# Make scripts/ importable without requiring it to be a package
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from parse_html import parse_html  # noqa: E402


def test_lowercase_rel_canonical_and_alternate_still_work():
    """Baseline: the existing lower-case forms are unaffected by the fix."""
    html = (
        "<html><head>"
        '<link rel="canonical" href="https://example.com/page">'
        '<link rel="alternate" hreflang="en-US" href="https://example.com/en">'
        "</head></html>"
    )
    result = parse_html(html)
    assert result["canonical"] == "https://example.com/page"
    assert result["hreflang"] == [{"lang": "en-US", "href": "https://example.com/en"}]


def test_titlecase_rel_alternate_is_detected():
    html = (
        "<html><head>"
        '<link href="https://example.com/en" hreflang="en-US" rel="Alternate">'
        "</head></html>"
    )
    result = parse_html(html)
    assert result["hreflang"] == [{"lang": "en-US", "href": "https://example.com/en"}]


def test_uppercase_rel_attribute_name_and_titlecase_canonical_is_detected():
    html = '<html><head><link REL="Canonical" href="https://example.com/page"></head></html>'
    result = parse_html(html)
    assert result["canonical"] == "https://example.com/page"


def test_uppercase_rel_value_alternate_is_detected():
    html = (
        "<html><head>"
        '<link rel="ALTERNATE" hreflang="fr" href="https://example.com/fr">'
        "</head></html>"
    )
    result = parse_html(html)
    assert result["hreflang"] == [{"lang": "fr", "href": "https://example.com/fr"}]


def test_mixed_case_rel_attribute_order_does_not_matter():
    """`rel` before or after `hreflang`/`href` must both be detected."""
    html = (
        "<html><head>"
        '<link hreflang="de" href="https://example.com/de" rel="Alternate">'
        '<link rel="Alternate" hreflang="es" href="https://example.com/es">'
        "</head></html>"
    )
    result = parse_html(html)
    assert {"lang": "de", "href": "https://example.com/de"} in result["hreflang"]
    assert {"lang": "es", "href": "https://example.com/es"} in result["hreflang"]


def test_self_closing_mixed_case_link_tags_are_detected():
    html = (
        "<html><head>"
        '<link rel="Canonical" href="https://example.com/page" />'
        '<link rel="Alternate" hreflang="en" href="https://example.com/en" />'
        "</head></html>"
    )
    result = parse_html(html)
    assert result["canonical"] == "https://example.com/page"
    assert result["hreflang"] == [{"lang": "en", "href": "https://example.com/en"}]


def test_lowercase_rel_still_ignores_unrelated_link_types():
    html = (
        "<html><head>"
        '<link rel="stylesheet" href="https://example.com/style.css">'
        '<link rel="Preload" href="https://example.com/font.woff2">'
        "</head></html>"
    )
    result = parse_html(html)
    assert result["canonical"] is None
    assert result["hreflang"] == []
