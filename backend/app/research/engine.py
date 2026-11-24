
import asyncio
import json
import re

from app.research.schemas import ResearchRequest, ResearchResponse
from app.research.providers import WebSearchProvider
from app.research.extractor import WebpageExtractor
from app.research.analyzer import IntelligenceAnalyzer
from app.research.synthesizer import AISynthesizer
from app.research.evidence_verifier import verify_evidence

class ResearchEngine:
    def __init__(self):
        self.search_provider = WebSearchProvider()
        self.extractor = WebpageExtractor(max_chars=12000)
        self.analyzer = IntelligenceAnalyzer()
        self.synthesizer = AISynthesizer()

    @staticmethod
    def _validate_claims(items, valid_source_ids, source_evidence=None):
        source_evidence = source_evidence or {}
        """
        Validate AI-generated claims against real collected source IDs.
        Invalid IDs are removed. Claims without valid citations are discarded.
        """

        validated = []
        invalid_citation_count = 0
        discarded_claim_count = 0

        if not isinstance(items, list):
            return validated, invalid_citation_count, discarded_claim_count

        for item in items:
            if not isinstance(item, dict):
                discarded_claim_count += 1
                continue

            claim = item.get("claim", "")

            if not isinstance(claim, str) or not claim.strip():
                discarded_claim_count += 1
                continue

            source_ids = item.get("source_ids", [])

            if not isinstance(source_ids, list):
                source_ids = []

            valid_ids = []
            for source_id in source_ids:
                if (
                    isinstance(source_id, str)
                    and source_id in valid_source_ids
                ):
                    if source_id not in valid_ids:
                        valid_ids.append(source_id)
                else:
                    invalid_citation_count += 1

            # Never keep a claim without at least one valid source.
            if not valid_ids:
                discarded_claim_count += 1
                continue

            evidence_type = item.get("evidence_type", "inference")

            allowed_types = {
                "reported_fact",
                "inference",
                "trend",
            }

            if evidence_type not in allowed_types:
                evidence_type = "inference"

            combined_evidence = "\n\n".join(
                source_evidence.get(source_id, "")
                for source_id in valid_ids
            ).strip()

            verification = verify_evidence(
                claim,
                combined_evidence
            )

            validated.append(
                {
                    "claim": claim.strip(),
                    "source_ids": valid_ids,
                    "evidence_type": evidence_type,
                    "verification": verification.model_dump(),
                }
            )

        return (
            validated,
            invalid_citation_count,
            discarded_claim_count,
        )

    async def run(self, request: ResearchRequest) -> ResearchResponse:
        try:
            # STEP 1 — SEARCH
            sources = await self.search_provider.search(
                query=request.query,
                max_results=request.max_sources,
            )

            if not sources:
                return ResearchResponse(
                    status="no_results",
                    query=request.query,
                    research_mode=request.research_mode,
                    summary="No relevant web sources were found.",
                    findings=[],
                    sources=[],
                    analysis={"analysis_status": "no_evidence"},
                    synthesis={},
                    error=None,
                )

            # STEP 2 — EXTRACT WEBPAGE CONTENT
            extraction_results = await asyncio.gather(
                *[
                    self.extractor.extract(source)
                    for source in sources
                ],
                return_exceptions=True,
            )

            findings = []
            successful_extractions = 0

            # Store extracted webpage text mapped to source IDs
            source_evidence = {}

            for index, (source, result) in enumerate(
                zip(sources, extraction_results),
                start=1,
            ):
                source.id = f"S{index}"
                source_id = source.id

                if isinstance(result, Exception):
                    findings.append(
                        f"Source ID: {source_id}\n"
                        f"Source: {source.title}\n"
                        f"URL: {source.url}\n"
                        f"Search snippet: {source.snippet}\n"
                        f"Extraction failed: {str(result)}"
                    )
                    continue

                if result["status"] == "success":
                    successful_extractions += 1
                    source_evidence[source_id] = result.get("content", "")

                    findings.append(
                        f"Source ID: {source_id}\n"
                        f"Source: {result['title']}\n"
                        f"URL: {result['url']}\n"
                        f"Website: {result['source_name']}\n"
                        f"Extracted content:\n"
                        f"{result['content']}"
                    )
                else:
                    findings.append(
                        f"Source ID: {source_id}\n"
                        f"Source: {source.title}\n"
                        f"URL: {source.url}\n"
                        f"Search snippet: {source.snippet}\n"
                        f"Webpage extraction failed: {result['error']}"
                    )

            # STEP 3 — PYTHON ANALYSIS
            analysis = self.analyzer.analyze(findings)

            analysis["successful_extractions"] = successful_extractions
            analysis["failed_extractions"] = (
                len(sources) - successful_extractions
            )

            base_summary = (
                f"NYRA collected {len(sources)} sources, "
                f"read {successful_extractions} webpages, "
                f"and analyzed {analysis['total_words']} words."
            )

            # STEP 4 — AI SYNTHESIS
            synthesis = {
                "status": "not_configured",
                "summary": "",
                "key_findings": [],
                "patterns": [],
                "contradictions": [],
                "opportunities": [],
                "citation_validation": {},
                "error": None,
            }

            if request.ai_api_key:
                limited_findings = [
                    finding[:6000]
                    for finding in findings
                ]

                synthesis_result = await self.synthesizer.synthesize(
                    query=request.query,
                    research_findings=limited_findings,
                    api_key=request.ai_api_key,
                    model=request.ai_model,
                    base_url=request.ai_base_url,
                )

                if synthesis_result.get("status") == "success":
                    raw_response = synthesis_result.get(
                        "raw_response", ""
                    )

                    try:
                        cleaned_response = re.sub(
                            r"^```(?:json)?\s*|\s*```$",
                            "",
                            raw_response.strip(),
                        )

                        parsed_synthesis = json.loads(
                            cleaned_response
                        )

                        valid_source_ids = {
                            source.id for source in sources
                        }

                        # Validate each AI-generated section
                        key_findings, invalid_1, discarded_1 = (
                            self._validate_claims(
                                parsed_synthesis.get(
                                    "key_findings", []
                                ),
                                valid_source_ids,
                                source_evidence
                            )
                        )

                        patterns, invalid_2, discarded_2 = (
                            self._validate_claims(
                                parsed_synthesis.get(
                                    "patterns", []
                                ),
                                valid_source_ids,
                            )
                        )

                        contradictions, invalid_3, discarded_3 = (
                            self._validate_claims(
                                parsed_synthesis.get(
                                    "contradictions", []
                                ),
                                valid_source_ids,
                            )
                        )

                        opportunities, invalid_4, discarded_4 = (
                            self._validate_claims(
                                parsed_synthesis.get(
                                    "opportunities", []
                                ),
                                valid_source_ids,
                            )
                        )

                        invalid_citations = (
                            invalid_1
                            + invalid_2
                            + invalid_3
                            + invalid_4
                        )

                        discarded_claims = (
                            discarded_1
                            + discarded_2
                            + discarded_3
                            + discarded_4
                        )

                        synthesis = {
                            "status": "success",
                            "summary": parsed_synthesis.get(
                                "summary", ""
                            ),
                            "key_findings": key_findings,
                            "patterns": patterns,
                            "contradictions": contradictions,
                            "opportunities": opportunities,
                            "citation_validation": {
                                "available_source_ids": sorted(
                                    valid_source_ids
                                ),
                                "invalid_citations_removed": (
                                    invalid_citations
                                ),
                                "unsupported_claims_discarded": (
                                    discarded_claims
                                ),
                            },
                            "error": None,
                        }

                    except (json.JSONDecodeError, TypeError):
                        synthesis = {
                            "status": "invalid_response",
                            "summary": "",
                            "key_findings": [],
                            "patterns": [],
                            "contradictions": [],
                            "opportunities": [],
                            "citation_validation": {},
                            "error": (
                                "The AI returned an invalid JSON "
                                "response."
                            ),
                        }

                else:
                    synthesis = {
                        "status": "failed",
                        "summary": "",
                        "key_findings": [],
                        "patterns": [],
                        "contradictions": [],
                        "opportunities": [],
                        "citation_validation": {},
                        "error": synthesis_result.get("error"),
                    }

            # STEP 5 — FINAL RESPONSE
            final_summary = base_summary

            if (
                synthesis["status"] == "success"
                and synthesis.get("summary")
            ):
                final_summary = synthesis["summary"]

            return ResearchResponse(
                status="success",
                query=request.query,
                research_mode=request.research_mode,
                summary=final_summary,
                findings=findings,
                sources=sources,
                analysis=analysis,
                synthesis=synthesis,
                error=None,
            )

        except Exception as error:
            return ResearchResponse(
                status="error",
                query=request.query,
                research_mode=request.research_mode,
                summary="Research pipeline failed.",
                findings=[],
                sources=[],
                analysis={},
                synthesis={},
                error=str(error),
            )
