"""AG-UI bridge exposing SupportFlow to a CopilotKit frontend."""

from ag_ui_crewai.endpoint import add_crewai_flow_fastapi_endpoint
from fastapi import FastAPI

from support_flow import SupportFlow

app = FastAPI(title="Support Flow Agent Server")

flow = SupportFlow()
add_crewai_flow_fastapi_endpoint(
    app=app,
    flow=flow,
    path="/conversation",
    conversational=True,
)
