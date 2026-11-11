from __future__ import annotations

import hashlib
import time
from typing import Any

from crewai.flow.flow import Flow, listen, router, start

from flow.crews.figure_analyst.crew import FigureAnalystCrew
from flow.state import ScienceFlowState

_MAX_RETRIES = 2
_RETRY_DELAY = 3  # seconds between retries
_CHUNK_SIZE = 5  # figures per LLM call — the prompt already handles a list


def _require_pydantic(result: Any, step_name: str) -> Any:
    if result.pydantic is None:
        raise ValueError(
            f"{step_name} produced no structured output: {result.raw[:200]}"
        )
    return result.pydantic


class ScienceFlow(Flow[ScienceFlowState]):
    """Orchestrates figure analysis."""

    @start()
    def validate_extraction(self):
        if not self.state.figures:
            self.state.quality = "poor"
            self.state.error = "No figures extracted from document."
        else:
            self.state.quality = "good"
        return self.state.quality

    @router(validate_extraction)
    def route_on_quality(self, quality: str):
        if quality == "good":
            return "analyze"
        return "abort"

    @listen("analyze")
    def analyze_figures(self):
        all_intelligences = []
        failed_ids: list[str] = []

        # Different figure_ids can resolve to the same embedded page image
        # (OCR page-matching ambiguity). Drop the repeats before they're sent
        # for analysis — same image would otherwise burn LLM calls twice and
        # produce duplicate cards.
        seen_hashes: dict[str, str] = {}
        figures = []
        for f in self.state.figures:
            if f.thumbnail_b64:
                img_hash = hashlib.sha256(f.thumbnail_b64.encode()).hexdigest()
                if img_hash in seen_hashes:
                    print(
                        f"[ScienceFlow] Dropping {f.figure_id} (p.{f.page_number}) — "
                        f"same image as {seen_hashes[img_hash]}"
                    )
                    continue
                seen_hashes[img_hash] = f"{f.figure_id} (p.{f.page_number})"
            figures.append(f)

        for chunk_start in range(0, len(figures), _CHUNK_SIZE):
            chunk = figures[chunk_start : chunk_start + _CHUNK_SIZE]
            chunk_ids = [f.figure_id for f in chunk]

            fig_dicts = []
            for f in chunk:
                fig_dict = f.model_dump(exclude={"thumbnail_b64"})
                if f.thumbnail_b64:
                    # A local filesystem path is useless to a remote model — it
                    # can't fetch it. Send the image inline as a data URI instead,
                    # which is what the add_image_tool actually needs.
                    b64 = f.thumbnail_b64
                    fig_dict["image_path"] = (
                        b64 if b64.startswith("data:") else f"data:image/png;base64,{b64}"
                    )
                fig_dicts.append(fig_dict)

            last_exc: Exception | None = None
            for attempt in range(1 + _MAX_RETRIES):
                try:
                    result = (
                        FigureAnalystCrew().crew().kickoff(inputs={"figures": fig_dicts})
                    )
                    out = _require_pydantic(
                        result, f"Figure analyst ({', '.join(chunk_ids)})"
                    )
                    all_intelligences.extend(out.figures)
                    last_exc = None
                    break
                except Exception as exc:
                    last_exc = exc
                    if attempt < _MAX_RETRIES:
                        print(
                            f"[ScienceFlow] chunk {chunk_ids} attempt {attempt + 1} "
                            f"failed ({type(exc).__name__}), retrying in {_RETRY_DELAY}s…"
                        )
                        time.sleep(_RETRY_DELAY)

            if last_exc is not None:
                print(
                    f"[ScienceFlow] Skipping chunk {chunk_ids} after "
                    f"{1 + _MAX_RETRIES} attempts: {last_exc}"
                )
                failed_ids.extend(chunk_ids)

        self.state.figure_intelligences = all_intelligences
        if failed_ids:
            self.state.error = (
                f"Analysis failed for {len(failed_ids)} figure(s): "
                f"{', '.join(failed_ids)}"
            )
        return "analyzed"

    @listen("abort")
    def handle_poor_quality(self):
        return "aborted"
