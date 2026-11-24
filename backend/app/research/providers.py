import asyncio
from urllib.parse import urlparse

from ddgs import DDGS

from app.research.schemas import ResearchSource


class WebSearchProvider:

    def __init__(self):
        self.provider_name = "DuckDuckGo"

    def _search_sync(self, query: str, max_results: int):
        """
        Performs synchronous web search.
        """

        with DDGS() as search_client:
            results = search_client.text(
                query,
                max_results=max_results
            )

            return list(results)

    async def search(
        self,
        query: str,
        max_results: int = 5
    ) -> list[ResearchSource]:
        """
        Searches the web and returns standardized research sources.
        """

        raw_results = await asyncio.to_thread(
            self._search_sync,
            query,
            max_results
        )

        sources = []

        for result in raw_results:

            url = result.get("href", "")

            if not url:
                continue

            parsed_url = urlparse(url)

            source = ResearchSource(
                title=result.get("title", "Untitled"),
                url=url,
                snippet=result.get("body", ""),
                source_name=parsed_url.netloc
            )

            sources.append(source)

        return sources