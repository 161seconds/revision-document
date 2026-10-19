---
"mattpocock-skills": patch
---

`wizard` template fixes: `ask` uses Readline so arrow keys move the cursor (#741); `write_env` single-quotes values so spaces, `#`, `$` and quotes survive `source` and dotenv (#770); `open_url` prints the open-it-yourself warning when no browser opener exists (#774); `write_env` writes through a symlinked `.env` and keeps an existing file's mode (#811); `ask` and `ask_secret` fail at EOF instead of looping (#852).
