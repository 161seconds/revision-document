from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from models import ExtractedFigure

_OCR_MODEL = "mistral-ocr-4-0"

_FIGURE_SCHEMA = {
    "type": "object",
    "properties": {
        "figures": {
            "type": "array",
            "description": "List of figures extracted from the document",
            "items": {
                "type": "object",
                "properties": {
                    "figure_id": {
                        "type": "string",
                        "description": "Figure label e.g. Figure 1, Fig. 2A",
                    },
                    "page_number": {
                        "type": "integer",
                        "description": (
                            "The 1-based position of this page within the PDF file itself "
                            "(the first page you see is 1, the second is 2, etc.), counting "
                            "sequentially from the start of the document. Do NOT use any "
                            "printed journal/volume page number found in a header or footer "
                            "(e.g. ignore a footer reading 'Nature Medicine | Volume 31 | "
                            "3196-3208' — that is not this field)."
                        ),
                    },
                    "chart_type": {
                        "type": "string",
                        "description": "bar, line, scatter, survival curve, dose-response, heatmap, Western blot, micrograph, other",
                    },
                    "title": {
                        "type": "string",
                        "description": "Figure title or caption headline",
                    },
                    "x_axis": {
                        "type": "string",
                        "description": "X-axis label and units if applicable",
                    },
                    "y_axis": {
                        "type": "string",
                        "description": "Y-axis label and units if applicable",
                    },
                    "data_summary": {
                        "type": "string",
                        "description": "Key values, ranges, or trends visible in the figure",
                    },
                    "conditions": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Experimental conditions or comparison groups",
                    },
                    "caption": {
                        "type": "string",
                        "description": "Full figure caption text",
                    },
                },
            },
        }
    },
}

_DOCUMENT_ANNOTATION_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "figures",
        "schema_definition": _FIGURE_SCHEMA,
        "strict": False,
    },
}


def run_science_pipeline(client, file_path: str) -> dict:
    """Upload a PDF and run Mistral OCR 4 with Document AI figure extraction."""
    with open(file_path, "rb") as f:
        uploaded = client.files.upload(
            file={"file_name": Path(file_path).name, "content": f.read()},
            purpose="ocr",
            visibility="user",
        )

    try:
        ocr_response = client.ocr.process(
            model=_OCR_MODEL,
            document={"type": "file", "file_id": uploaded.id},
            document_annotation_format=_DOCUMENT_ANNOTATION_FORMAT,
            include_image_base64=True,
            include_blocks=True,
            confidence_scores_granularity="page",
        )
    finally:
        # Don't leave analyzed papers sitting in Mistral file storage.
        try:
            client.files.delete(file_id=uploaded.id)
        except Exception:
            pass

    return {"ocr": ocr_response}


def _page_images_sorted(page) -> list[str]:
    """Embedded images on a page, base64, ordered top-to-bottom by position."""
    images = [img for img in (page.images or []) if img.image_base64]
    images.sort(key=lambda img: img.top_left_y if img.top_left_y is not None else 0)
    return [img.image_base64 for img in images]


_WORD_RE = re.compile(r"[a-zA-Z]{4,}")
_MIN_MATCH_TOKENS = 4
_MIN_MATCH_OVERLAP = 0.6


def _resolve_page_index(fig: dict, pages) -> int | None:
    """Find OCR page that contains figure by word-overlap between caption and markdown."""
    text = fig.get("caption") or fig.get("title") or ""
    tokens = {t.lower() for t in _WORD_RE.findall(text)}
    if len(tokens) < _MIN_MATCH_TOKENS:
        return None

    best_index: int | None = None
    best_overlap = 0.0
    for page in pages:
        page_tokens = {t.lower() for t in _WORD_RE.findall(page.markdown or "")}
        if not page_tokens:
            continue
        overlap = len(tokens & page_tokens) / len(tokens)
        if overlap > best_overlap:
            best_overlap = overlap
            best_index = page.index

    return best_index if best_overlap >= _MIN_MATCH_OVERLAP else None


def parse_pipeline_results(
    pipeline_results: dict,
) -> tuple[list[ExtractedFigure], int, float | None]:
    """Parse OCR response into figures, page count, and average page confidence."""
    ocr_response = pipeline_results["ocr"]
    pages = ocr_response.pages
    page_count = len(pages)

    scores = [
        p.confidence_scores.average_page_confidence_score
        for p in pages
        if p.confidence_scores
    ]
    confidence_score: float | None = sum(scores) / len(scores) if scores else None

    # Page-indexed image lists, keyed by the true 0-based page.index. A single
    # shared cursor per real page index means multiple figures confidently
    # resolved to the same physical page consume distinct images in order,
    # instead of each independently starting at images[0].
    page_images: dict[int, list[str]] = {}
    for page in pages:
        images = _page_images_sorted(page)
        if images:
            page_images[page.index] = images

    raw = ocr_response.document_annotation
    if raw is None:
        raise RuntimeError(
            "document_annotation is None — the OCR step returned no structured data."
        )

    try:
        pages_data = json.loads(raw) if isinstance(raw, str) else raw
        all_figs = (
            pages_data.get("figures", []) if isinstance(pages_data, dict) else []
        )

        figures: list[ExtractedFigure] = []
        page_cursor: dict[int, int] = {}

        def _take_image(real_index: int) -> str | None:
            images = page_images.get(real_index, [])
            idx = page_cursor.get(real_index, 0)
            if idx >= len(images):
                # Page has no more distinct images for this many figures.
                # Returning None (rather than reusing the last image) avoids
                # silently pairing this figure with an image that actually
                # belongs to a different one.
                return None
            page_cursor[real_index] = idx + 1
            return images[idx]

        for fig in all_figs:
            resolved_index = _resolve_page_index(fig, pages)
            if resolved_index is not None:
                real_index = resolved_index
            else:
                # Schema asks for a 1-based page_number; prefer the 0-based
                # conversion, falling back to the raw value in case the model
                # didn't follow the schema convention.
                raw_page_number = fig.get("page_number", 0)
                candidates = [raw_page_number - 1, raw_page_number]
                real_index = next(
                    (
                        c
                        for c in candidates
                        if page_cursor.get(c, 0) < len(page_images.get(c, []))
                    ),
                    max(raw_page_number - 1, 0),
                )

            thumb = _take_image(real_index)
            page_num = real_index + 1

            figures.append(
                ExtractedFigure(
                    figure_id=fig.get("figure_id", f"Figure {len(figures) + 1}"),
                    page_number=page_num,
                    chart_type=fig.get("chart_type", "unknown"),
                    title=fig.get("title", ""),
                    x_axis=fig.get("x_axis"),
                    y_axis=fig.get("y_axis"),
                    data_summary=fig.get("data_summary", ""),
                    conditions=fig.get("conditions") or [],
                    caption=fig.get("caption", ""),
                    thumbnail_b64=thumb,
                )
            )

        return figures, page_count, confidence_score

    except Exception as exc:
        raise RuntimeError(f"Failed to parse extraction results: {exc}") from exc
