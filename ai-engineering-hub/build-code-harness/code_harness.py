import os

from dotenv import load_dotenv
load_dotenv()

from crewai import LLM, Agent, Crew, Process, Task
from crewai_tools import DirectoryReadTool, FileReadTool, FileWriterTool

# 1) THE BRAIN ---------------------------------------------------------------
# The model is interchangeable -- CrewAI's version of "works with any LLM".
MODEL = os.getenv("MODEL", "openrouter/anthropic/claude-sonnet-4-6")  # swap here
llm = LLM(model=MODEL)

# 2) THE HANDS (tools) -------------------------------------------------------
# Claude Code's read_file / write_file / ls map directly onto CrewAI file tools.
read_file = FileReadTool()
write_file = FileWriterTool()  # overwrites; "edit" = read-then-write
list_dir = DirectoryReadTool()
filesystem_tools = [read_file, write_file, list_dir]

# The sandbox: Claude Code runs shell commands and tests inside an isolated
# environment. The supported path in CrewAI is a real sandbox service.
# E2B gives shell + Python in an ephemeral VM, and the shell covers grep/glob via actual grep/find.
sandbox_tools = []
exec_tool = None
if os.getenv("E2B_API_KEY"):
    from crewai_tools import E2BExecTool, E2BPythonTool

    exec_tool = E2BExecTool()
    sandbox_tools = [exec_tool, E2BPythonTool()]  # run tests / run code

# A custom tool: no built-in understands "run the test suite and report
# pass/fail," only generic shell execution. It submits the command
# through the exec_tool instance above instead, via E2BExecTool's own
# command: str argument, so it runs inside the same isolated VM as everything
# else the coder and tester do -- a thin, test-shaped wrapper around real
# sandboxed execution.
from crewai.tools import tool

if exec_tool is not None:
    @tool("run_tests")
    def run_tests(path: str = "tests/") -> str:
        """Run the pytest suite at the given path inside the sandbox and return the result."""
        return exec_tool.run(command=f"pytest {path} -q")
    custom_tools = [run_tests]
else:
    # No E2B key means no sandbox at all, so there is nowhere safe to run this.
    # Leaving it undefined here is deliberate: a tool with nothing to route
    # into isn't a tool worth handing to an agent.
    custom_tools = []

# 3) THE HELPERS (sub-agents) ------------------------------------------------
# Claude Code spawns sub-agents to split work and isolate context. In CrewAI a
# "sub-agent" is just another Agent the manager can delegate to. The role / goal
# / backstory IS that agent's system prompt -- this is where reliability is tuned.
explorer = Agent(
    role="Codebase Explorer",
    goal="Map the repository and surface the files relevant to the task.",
    backstory=(
        "You read directories and files to build an accurate picture of the code "
        "before any change is made. You never guess at file contents -- you read them."
    ),
    tools=[read_file, list_dir],
    llm=llm,
    verbose=True,
)

coder = Agent(
    role="Software Engineer",
    goal="Implement the requested change by editing files on disk.",
    backstory=(
        "You write minimal, correct edits. You read a file before you overwrite it "
        "and keep every change scoped to the task at hand."
    ),
    tools=filesystem_tools + sandbox_tools,
    llm=llm,
    # reasoning=True is the agent-level planning surface, distinct from the
    # crew-level planning=True below: this agent reflects and drafts its own
    # short plan before executing its task, rather than the crew planning
    # once for everyone up front. Worth it here specifically because editing
    # files on disk is the one action in this crew that is hardest to undo.
    reasoning=True,
    verbose=True,
)

tester = Agent(
    role="Test Runner",
    goal="Run the project's tests in the sandbox and report pass/fail with output.",
    backstory=(
        "You execute commands in an isolated sandbox and report exactly what "
        "happened. You never claim a test passed without running it."
    ),
    tools=sandbox_tools + [read_file] + custom_tools,
    llm=llm,
    verbose=True,
)

# 4) THE ORCHESTRATOR (sub-agent spawning) -----------------------------------
# Hierarchical process == a manager agent that delegates to the helpers above:
# the CrewAI analogue of Claude Code spawning and coordinating sub-agents.
manager = Agent(
    role="Engineering Lead",
    goal="Break the request into steps and delegate each to the right specialist.",
    backstory=(
        "You own the outcome. You decide who does what, review their results, and "
        "only finish once the change is implemented and the tests have actually run."
    ),
    llm=llm,
    allow_delegation=True,  # delegation is off by default; the manager needs it on
    verbose=True,
)

# 5) THE TASK ----------------------------------------------------------------
# One open-ended objective. The planner + manager decompose it; we do not
# pre-assign it to an agent, so the manager is free to delegate.
# human_input=True is CrewAI's human-in-the-loop gate: once the crew has an
# answer, it pauses and asks for approval/feedback on the CLI before the run is considered finished.
task = Task(
    description=(
        "In the working directory ./workspace, {objective}. "
        "Explore the code first, make the change, then run the tests and report."
    ),
    expected_output="A summary of the files changed and the final test output.",
    human_input=True,
)

# 6) THE LOOP + THE CHECKLIST  (planning=True is the 'deep agent' switch) -----
# crew.kickoff() is the loop. planning=True is the part that turns a shallow
# tool-calling crew into a *deep* agent: before each iteration an AgentPlanner
# writes a step-by-step plan and injects it into the task -- CrewAI's equivalent
# of Claude Code's todo-list planning tool (planning as context engineering).
# planning defaults to gpt-4o-mini.
#
# memory=True turns on CrewAI's unified Memory system: the crew
# remembers what happened on past kickoff() calls, not just within one run.
# This is what beats the context-window limit across sessions, not just
# within a single task -- the CrewAI analogue of Claude Code's long-term
# memory and persistence.

# 7) APPROVING COMMANDS (human-in-the-loop, before a tool runs) --------------
# Task(human_input=True) above reviews the *finished* answer. This hook is a
# different, earlier gate: it intercepts a specific tool call *before* it
# runs and can block it outright. This is the closer CrewAI analogue to
# Claude Code's permission layer -- enforcement that sits outside the model,
# not a prompt asking it to be careful. Returning False from the hook blocks
# the call; returning None lets it through unchanged.
#
# GATED_TOOLS is built from the actual tool objects we already import and
# instantiate above (write_file, sandbox_tools).
# run_tests is included by its literal name -- we set that string ourselves
# via @tool("run_tests"), so it's the one name in this set we know for certain.
# It earns a spot in the gate now that it submits a real command through exec_tool 
# instead of running unsandboxed.
# it's constrained to `pytest {path} -q`, which is narrower than the raw
# E2BExecTool it wraps, but it still executes inside the sandbox, so it goes
# through the same approval gate as everything else that does.
from crewai.hooks import before_tool_call

GATED_TOOLS = {write_file.name, "run_tests", *(t.name for t in sandbox_tools)}


@before_tool_call
def require_approval(context):
    if context.tool_name in GATED_TOOLS:
        # ToolCallHookContext has no built-in "ask a human" method -- it only
        # exposes tool_name, tool_input, tool, agent, task, crew, and
        # tool_result. Blocking on stdin here is consistent with how
        # Task(human_input=True) above already works.
        response = input(
            f"Approve {context.tool_name} with input {context.tool_input}? [yes/no] "
        )
        if response.strip().lower() != "yes":
            return False  # blocks the call; the agent is told it was denied
    return None

# 8) CHECKPOINTING (survive an interruption, resume without redoing work) ----
# checkpoint=True writes crew state to ./.checkpoints/ after each completed
# task. A long run that gets killed partway through can resume from the last
# saved checkpoint instead of starting over -- the CrewAI analogue of a long
# task surviving an interruption, distinct from memory=True above (memory is
# recall of facts across runs; checkpointing is resuming an interrupted run).
crew = Crew(
    agents=[explorer, coder, tester],
    tasks=[task],
    manager_agent=manager,
    process=Process.hierarchical,
    planning=True,
    planning_llm=LLM(model="openrouter/openai/gpt-4o-mini"),
    memory=True,
    checkpoint=True,
    verbose=True,
)

if __name__ == "__main__":
    # A real ticket: the ./workspace repo ships a failing pytest suite
    # (3 failing, 2 passing) with two genuine bugs. Solving it forces the full
    # harness loop -- explore the repo, plan the fixes, edit, run tests, iterate
    # until green -- which is the whole reason a deep agent beats a single call.
    result = crew.kickoff(inputs={
        "objective": (
            "make the failing pytest suite pass. Users report two bugs "
            "in account.py: withdrawals can overdraw an account past zero, and a "
            "transfer does not move money into the recipient's account. Read account.py "
            "and the tests under tests/, fix ONLY account.py (never edit a test), and "
            "run `pytest tests/ -q` until every test passes."
        ),
    })
    print(result)
