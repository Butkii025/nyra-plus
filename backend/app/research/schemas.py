from typing import Literal
from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Topic or question to research"
    )

    research_mode: Literal["quick", "balanced", "deep"] = Field(
        default="balanced",
        description="Depth of research"
    )

    max_sources: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of sources to collect"
    )

    ai_api_key: str | None = None
    ai_model: str = "gpt-4o-mini"
    ai_base_url: str = "https://api.openai.com/v1"

class EvidenceVerification(BaseModel):
    verification_status: Literal[
        "supported",
        "partially_supported",
        "unverified",
        "not_checked"
    ] = "not_checked"

    evidence_excerpt: str = ""

    verification_confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Verification confidence between 0 and 1"
    )

class ResearchSource(BaseModel):
    id: str = ""
    title: str
    url: str
    snippet: str = ""
    source_name: str = ""


class ResearchResponse(BaseModel):
    status: str
    query: str
    research_mode: str
    summary: str = ""
    findings: list[str] = Field(default_factory=list)
    sources: list[ResearchSource] = Field(default_factory=list)
    analysis: dict = Field(default_factory=dict)
    error: str | None = None

    synthesis: dict = Field(default_factory=dict)

    # Research Quality Score
    quality_score: float = Field(default=0.0, ge=0.0, le=100.0)
    quality_details: dict = Field(default_factory=dict)