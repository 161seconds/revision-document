"""E-commerce support assistant built on CrewAI conversational flows."""

import logging
import os
import re

from crewai import Agent, Crew, Flow, LLM, Process, Task
from crewai.experimental.conversational import (
    ConversationConfig,
    ConversationState,
    RouterConfig,
)
from crewai.flow import listen, persist
from crewai.knowledge.source.text_file_knowledge_source import TextFileKnowledgeSource
from crewai_tools import ExaSearchTool
from dotenv import load_dotenv

from order_db import OrderManagementAPI

load_dotenv()


logger = logging.getLogger(__name__)

# --- stand-ins for real systems -----------------------------------------
#
# ORDER_SERVICE wraps a local SQLite file (order_db.py) behind the same
# get_order() call a real order-management API would expose.
#
# POLICY_KNOWLEDGE is a CrewAI knowledge source over knowledge/return_policies.md,
# queried with real RAG.

ORDER_SERVICE = OrderManagementAPI()

# TextFileKnowledgeSource + a Chroma-backed vector store under the hood
POLICY_KNOWLEDGE = TextFileKnowledgeSource(file_paths=["return_policies.md"])

# Points CrewAI's "openai"-shaped embedder at OpenRouter's OpenAI-compatible
# /api/v1/embeddings endpoint instead of api.openai.com, -- no OpenAI key needed.
POLICY_EMBEDDER = {
    "provider": "openai",
    "config": {
        "api_key": os.environ["OPENROUTER_API_KEY"],
        "api_base": "https://openrouter.ai/api/v1",
        "model": "liquid/lfm-2.5-embedding-350m:free",
    },
}


def extract_order_id(text: str) -> str | None:
    """Pull a known order id out of free text, e.g. "Where is order 4471?" -> "4471"."""
    # pull digit runs regardless of surrounding punctuation ("4471." / "(4471)")
    for token in re.findall(r"\d+", text):
        # cheap digit match first, then confirm against the DB
        if ORDER_SERVICE.get_order(token) is not None:
            return token
    return None


# --- state --------------------------------------------------------------------


class SupportState(ConversationState):
    """Adds the two fields later turns resolve pronouns against.

    ConversationState already provides `messages`, `last_intent`, and
    `events` -- this subclass only adds the domain-specific fields this
    flow needs to carry across turns within a session.
    """

    customer_id: str | None = None
    last_order_id: str | None = None


# --- LLMs -------------------------------------------------------------------

# Two roles, two models
ROUTER_LLM = LLM(model="openrouter/openai/gpt-4o-mini")
CONVERSATION_LLM = LLM(model="openrouter/openai/gpt-4o")

# --- router -------------------------------------------------------------------

router_config = RouterConfig(
    prompt=(
        "You route messages for an e-commerce support assistant. "
        "Pick the route that matches what the customer is asking for right now."
    ),
    llm=ROUTER_LLM,
    # Routes themselves are NOT listed here on purpose
    # the framework builds the catalog from each @listen("LABEL") docstring
    default_intent="converse",  # LLM call failed or no LLM configured
    fallback_intent="converse",  # LLM returned a route that does not exist
)


# --- conversational flow -------------------------------------------------------


@persist()
@ConversationConfig(
    llm=CONVERSATION_LLM,
    router=router_config,
    answer_from_history_llm=ROUTER_LLM,
    defer_trace_finalization=True,
)
class SupportFlow(Flow[SupportState]):
    # conversational=True swaps in the framework's built-in chat graph
    conversational = True

    # --- ORDER_LOOKUP: deterministic, no agent -----------------------------

    @listen("ORDER_LOOKUP")
    def handle_order_lookup(self) -> str:
        """Status, tracking, or delivery date for an order."""
        # DEMO SIMPLIFICATION: the order id comes straight from the user's
        # message and get_order() has no customer scope, so any known id
        # resolves. A production build must scope the lookup to an
        # authenticated customer (self.state.customer_id) and return this
        # same "not found" reply for both unknown and unauthorized orders.
        message = self.state.current_user_message or ""
        order_id = extract_order_id(message) or self.state.last_order_id
        order = ORDER_SERVICE.get_order(order_id)

        if order is None:
            reply = "I could not find that order. Could you share the order number?"
        else:
            self.state.last_order_id = order.order_id
            latest = order.latest_event
            is_arrival_followup = extract_order_id(message) is None and any(
                word in message.lower()
                for word in ("arrive", "here", "yet", "come", "delivered")
            )
            # no tracking scans yet -> fall back to status + shipment date
            status_reply = (
                f"Order {order.order_id} is {order.status}. "
                f"It shipped on {order.shipped:%b %d} via {order.carrier}."
            )
            if is_arrival_followup and latest is not None:
                if order.status == "delivered":
                    reply = (
                        f"Yes — order {order.order_id} was delivered on "
                        f"{latest.date:%b %d} at {latest.location}."
                    )
                else:
                    reply = (
                        f"Not yet. Order {order.order_id} is still {order.status} "
                        f"(last scan: {latest.status} at {latest.location} on "
                        f"{latest.date:%b %d})."
                    )
            else:
                reply = status_reply

        self.append_assistant_message(reply)
        return reply

    # --- RETURN_POLICY: 1-agent Crew doing real RAG -----------------------

    @listen("RETURN_POLICY")
    def handle_return_policy(self) -> str:
        """Returns, refunds, exchanges, and damaged item claims."""
        order = ORDER_SERVICE.get_order(self.state.last_order_id)
        category = order.category if order else "general merchandise"

        # knowledge_sources runs real RAG over return_policies.md at kickoff
        policy_agent = Agent(
            role="Policy specialist",
            goal="Answer return and refund questions using the return policy knowledge base",
            backstory="You know the store's return policies by heart and always cite the exact terms.",
            knowledge_sources=[POLICY_KNOWLEDGE],
            embedder=POLICY_EMBEDDER,
            llm=CONVERSATION_LLM,
        )
        policy_task = Task(
            description=(
                f"The customer's order is in the '{category}' category. "
                f"Using the return policy knowledge base, answer this question in "
                f"your own words, in 2-4 plain sentences: "
                f"{self.state.current_user_message}"
            ),
            expected_output=(
                "A short, natural-language reply a customer would actually read -- "
                "not a copy of the knowledge base's markdown, headers, or section "
                "titles. Reference the specific terms (window, condition, refund "
                "method) in sentence form."
            ),
            agent=policy_agent,
        )
        try:
            # single-agent sequential crew; one kickoff, RAG failures surface here
            result = Crew(
                agents=[policy_agent], tasks=[policy_task], process=Process.sequential
            ).kickoff()
            reply = result.raw
        except Exception:
            logger.exception(
                "Return-policy lookup failed for order %s", self.state.last_order_id
            )
            reply = (
                "I'm having trouble pulling up the exact policy terms right now. "
                "Could you try again in a moment?"
            )

        self.append_assistant_message(reply)
        return reply

    # --- RESEARCH: 2-agent Crew, output separation on display -------------

    @listen("RESEARCH")
    def handle_research(self) -> str:
        """Live carrier delays, weather disruptions, current external conditions."""
        # two roles: one gathers live facts via web search, one rewrites them for the customer
        researcher = Agent(
            role="Support researcher",
            goal="Find current information relevant to the customer's question",
            backstory="You check live sources before answering.",
            tools=[ExaSearchTool()],
            llm=CONVERSATION_LLM,
        )
        summarizer = Agent(
            role="Customer communicator",
            goal="Turn raw research findings into a short, customer-facing reply",
            backstory="You translate technical findings into plain, reassuring language.",
            llm=CONVERSATION_LLM,
        )

        # chained tasks -- summarize_task gets research_task's raw output as context
        research_task = Task(
            description=f"Research: {self.state.current_user_message}",
            expected_output="Raw findings relevant to the customer's question.",
            agent=researcher,
        )
        summarize_task = Task(
            description="Summarize the research findings into a short reply for the "
            "customer, in 2-3 sentences.",
            expected_output="A concise, customer-facing answer.",
            agent=summarizer,
            context=[research_task],
        )
        try:
            # runs both tasks in order; only the summarizer's output goes to the customer
            result = Crew(
                agents=[researcher, summarizer],
                tasks=[research_task, summarize_task],
                process=Process.sequential,
            ).kickoff()

            self.append_agent_result(
                "researcher", result.tasks_output[0].raw, visibility="private"
            )
            reply = result.raw
        except Exception:
            # don't log the user's message -- it may carry personal details
            logger.exception("Research crew failed")
            reply = "I couldn't pull up live information on that right now -- could you try again shortly?"

        self.append_assistant_message(reply)
        return reply


if __name__ == "__main__":
    from uuid import uuid4

    session_id = str(uuid4())  # fresh session each run
    flow = SupportFlow()

    # scripted multi-turn script: hits each route
    conversation = [
        "Where is order 4471?",
        "Has that arrived yet?",
        "Can I return it if it shows up damaged?",
        "Is there a Blue Dart service disruption in India right now?",
        "Sorry, what was the order number again?",
    ]

    # Every handle_turn() call here is a SEPARATE kickoff() under the hood
    # this loop is what a chat UI would do across several HTTP requests
    try:
        for message in conversation:
            reply = flow.handle_turn(message, session_id=session_id)
            print(f"\ncustomer: {message}")
            print(f"  route: {flow.state.last_intent}")
            print(f"  agent: {reply}")
    finally:
        flow.finalize_session_traces()

    print(f"\nmessages in history: {len(flow.state.messages)}")
    print(f"private agent results: {len(flow.state.events)}")
