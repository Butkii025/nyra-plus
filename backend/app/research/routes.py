from fastapi import APIRouter

from app.research.schemas import ResearchRequest, ResearchResponse
from app.research.engine import ResearchEngine


router = APIRouter(
    prefix="/research",
    tags=["Research"]
)

research_engine = ResearchEngine()


@router.post("/", response_model=ResearchResponse)
async def conduct_research(request: ResearchRequest):
    """
    Conduct web research using NYRA's Research Engine.
    """

    return await research_engine.run(request)