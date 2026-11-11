from __future__ import annotations

import os
from typing import List

from crewai import Agent, Crew, LLM, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task

from models import FigureIntelligenceList


# Mistral Small as multi-modal model, called directly via MISTRAL_API_KEY
# Update with FIGURE_ANALYST_MODEL env var to use a different model.
_FIGURE_MODEL = os.getenv("FIGURE_ANALYST_MODEL", "mistral/mistral-small-2603")


@CrewBase
class FigureAnalystCrew:
    """Crew for extracting structured intelligence from scientific figures."""

    agents: List[BaseAgent]
    tasks: List[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def figure_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["figure_analyst"],  # type: ignore[index]
            llm=LLM(model=_FIGURE_MODEL, reasoning_effort="none"),
            verbose=True,
            allow_delegation=False,
            multimodal=True,
        )

    @task
    def figure_analysis(self) -> Task:
        return Task(
            config=self.tasks_config["figure_analysis"],  # type: ignore[index]
            output_pydantic=FigureIntelligenceList,
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
