# Build Claude Code Harness using CrewAI

This project rebuilds popular coding-agents (Claude Code, etc.) harness from scratch: that explores, edits, tests, and reports on a real bug-fix task, with planning, memory, checkpointing, a sandbox, and human-in-the-loop approval built in one layer at a time.

- [E2B](https://e2b.dev) is used for sandboxed shell and Python execution.
- [CrewAI](https://docs.crewai.com/) to build the hierarchical Agentic workflow.
- [OpenRouter](https://openrouter.ai/models), as the underlying LLM provider.

---

## Setup and installations

**Get an E2B API Key**:

- Go to [E2B](https://e2b.dev) and sign up for an account.
- Create a new API key from your dashboard.
- Store it in the .env file (after renaming .env.example to .env).

```
E2B_API_KEY="..."
```

**Get an OpenRouter API Key** (or any LiteLLM-supported provider key):

- Go to [OpenRouter](https://openrouter.ai) and sign up for an account.
- Create a new API key.

```
OPENROUTER_API_KEY="..."
MODEL="openrouter/anthropic/claude-sonnet-4-6"
```

**Get an OpenAI API Key** (for memory only, not for the agents or the planner):

- `memory=True` is on for this crew, and CrewAI's memory system needs an embedding model to turn text into vectors before it can save or recall anything.
- By default that embedder is OpenAI's `text-embedding-3-large`, regardless of which provider the agents themselves run on, so this key is required even though every LLM call elsewhere in the project goes through OpenRouter.
- Go to [OpenAI](https://platform.openai.com/account/api-keys) and create a key.
- If you'd rather not add a second provider, point the crew at a different embedder instead (`embedder={"provider": "ollama", ...}` is a documented CrewAI option in [memory](http://docs.crewai.com/edge/en/concepts/memory)), or turn `memory=True` off.

```
OPENAI_API_KEY="..."
```

**Install Dependencies**:
Ensure you have Python 3.11 or later and [uv](https://docs.astral.sh/uv/) installed.

```bash
uv sync
```

---

## Run the project

Finally, head over to this folder:

```
cd build-code-harness
```

and run the project by running the following command:

```bash
uv run python code_harness.py
```

The task has `human_input=True`, so the run will pause once it has an answer and wait for your approval on the terminal before finishing.

`checkpoint=True` writes progress to `./.checkpoints/` after each completed task; safe to delete between runs, and worth adding to `.gitignore`.

## Sample Test

The demo repo in `workspace/` ships with two real bugs (an overdraft check missing from `withdraw`, and `transfer` crediting the wrong account) and a pytest suite that starts at 3 failing / 2 passing. A full run explores the code, fixes the implementation only, and drives the suite to 5 passing.

## 📬 Stay Updated with Our Newsletter!

**Get a FREE Data Science eBook** 📖 with 150+ essential lessons in Data Science when you subscribe to our newsletter! Stay in the loop with the latest tutorials, insights, and exclusive resources. [Subscribe now!](https://join.dailydoseofds.com)
[![Daily Dose of Data Science Newsletter](https://github.com/patchy631/ai-engineering/blob/main/resources/join_ddods.png)](https://join.dailydoseofds.com)

---

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.
