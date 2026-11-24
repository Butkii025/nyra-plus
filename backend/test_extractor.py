import asyncio

from app.research.extractor import WebpageExtractor
from app.research.schemas import ResearchSource


async def main():
    extractor = WebpageExtractor()

    test_source = ResearchSource(
        title="Python Official Website",
        url="https://www.python.org/about/",
        snippet="Official Python information",
        source_name="python.org"
    )

    print("\n🔍 NYRA PLUS WEBPAGE EXTRACTION TEST")
    print("=" * 55)

    result = await extractor.extract(test_source)

    print(f"\nStatus: {result['status']}")
    print(f"Title: {result['title']}")
    print(f"Source: {result['source_name']}")
    print(f"URL: {result['url']}")
    print(f"Extracted characters: {result['content_length']}")

    if result["status"] == "success":
        print("\n📄 EXTRACTED CONTENT PREVIEW:")
        print("-" * 55)
        print(result["content"][:1500])
        print("\n✅ Webpage extraction successful!")

    else:
        print(f"\n❌ Extraction failed: {result['error']}")


if __name__ == "__main__":
    asyncio.run(main())