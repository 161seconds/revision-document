from __future__ import annotations

import base64
import io
from typing import Optional

from PIL import Image


def decode_thumbnail(b64_str: Optional[str]) -> Optional[Image.Image]:
    """Decode a base64 string (raw or a data: URI) to an image."""
    if not b64_str:
        return None
    if b64_str.startswith("data:") and "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    try:
        data = base64.b64decode(b64_str)
        img = Image.open(io.BytesIO(data))
        img.load()
        return img
    except Exception:
        return None
