import httpx
from bs4 import BeautifulSoup

from app.research.schemas import ResearchSource


class WebpageExtractor:

    def __init__(self, max_chars: int = 12000):
        self.max_chars = max_chars

        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (compatible; NYRA PLUS Research Bot/1.0)"
            )
        }

    async def extract(self, source: ResearchSource) -> dict:
        """
        Fetch a webpage and extract readable text.
        """

        try:
            # Accept only HTTP and HTTPS URLs
            if not source.url.startswith(("http://", "https://")):
                return self._failed(source, "Unsupported URL scheme")

            async with httpx.AsyncClient(
                timeout=15.0,
                follow_redirects=True,
                headers=self.headers
            ) as client:

                response = await client.get(source.url)
                response.raise_for_status()

                # Parse webpage HTML
                soup = BeautifulSoup(response.text, "html.parser")

                # Remove unnecessary webpage elements
                for element in soup([
                    "script",
                    "style",
                    "noscript",
                    "nav",
                    "footer",
                    "header",
                    "aside",
                    "iframe"
                ]):
                    element.decompose()

                # Prefer article or main content if available
                content_area = (
                    soup.find("article")
                    or soup.find("main")
                    or soup.body
                    or soup
                )

                text = content_area.get_text(
                    separator=" ",
                    strip=True
                )

                # Clean excessive whitespace
                text = " ".join(text.split())

                # Limit content to control future AI token costs
                text = text[:self.max_chars]

                if not text:
                    return self._failed(
                        source,
                        "No readable webpage content found"
                    )

                return {
                    "status": "success",
                    "title": source.title,
                    "url": source.url,
                    "source_name": source.source_name,
                    "content": text,
                    "content_length": len(text),
                    "error": None
                }

        except httpx.TimeoutException:
            return self._failed(source, "Webpage request timed out")

        except httpx.HTTPStatusError as error:
            return self._failed(
                source,
                f"HTTP error: {error.response.status_code}"
            )

        except httpx.RequestError:
            return self._failed(
                source,
                "Unable to connect to webpage"
            )

        except Exception as error:
            return self._failed(source, str(error))

    def _failed(self, source: ResearchSource, error: str) -> dict:
        """
        Standardized response for failed webpage extraction.
        """

        return {
            "status": "failed",
            "title": source.title,
            "url": source.url,
            "source_name": source.source_name,
            "content": "",
            "content_length": 0,
            "error": error
        }