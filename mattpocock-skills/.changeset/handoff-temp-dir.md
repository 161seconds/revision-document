---
"mattpocock-skills": patch
---

`handoff` now names where the OS temp directory is (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows), so agents stop guessing (#272).
