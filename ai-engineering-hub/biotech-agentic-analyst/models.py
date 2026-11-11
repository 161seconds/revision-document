from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class ExtractedFigure(BaseModel):
    """Extracted figure from the document."""

    figure_id: str
    page_number: int
    chart_type: str
    title: str
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    data_summary: str
    conditions: list[str] = Field(default_factory=list)
    caption: str
    thumbnail_b64: Optional[str] = None


class FigureIntelligence(BaseModel):
    """Figure intelligence."""

    figure_id: str
    chart_type: str
    key_finding: str
    variables_compared: list[str] = Field(default_factory=list)
    quantitative_highlights: list[str] = Field(default_factory=list)
    biological_significance: str
    knowledge_base_tags: list[str] = Field(default_factory=list)
    is_quantitative_chart: bool = Field(
        description=(
            "True only for statistical/data charts (bar, line, scatter, pie, box plot, "
            "histogram, heatmap, dose-response curve, survival curve, forest plot, etc). "
            "False for micrographs, Western blots, photographs, illustrations, or any "
            "image that is not itself a plotted chart of data."
        ),
    )
    passes_sanity_check: bool = Field(
        description=(
            "True only if the image is clear/legible (not blurry, cropped, or low-res) "
            "AND its visual content matches the caption and data_summary."
        ),
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        description=(
            "If is_quantitative_chart or passes_sanity_check is False, a short "
            "explanation of which check failed and why. Otherwise None."
        ),
    )


class FigureIntelligenceList(BaseModel):
    """List of figure intelligences."""

    figures: list[FigureIntelligence] = Field(default_factory=list)
