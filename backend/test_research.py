import asyncio
from app.research.providers import WebSearchProvider


async def main():
    provider = WebSearchProvider()

    query = "Latest developments in artificial intelligence 2026"

    print("\n🔍 NYRA PLUS WEB SEARCH TEST")
    print("=" * 50)
    print(f"Query: {query}\n")

    try:
        results = await provider.search(query, max_results=5)

        if not results:
            print("⚠️ No search results returned.")
            return

        for index, result in enumerate(results, start=1):
            print(f"\n[{index}] {result.title}")
            print(f"Source: {result.source_name}")
            print(f"URL: {result.url}")
            print(f"Snippet: {result.snippet[:300]}")

        print("\n" + "=" * 50)
        print(f"✅ Search successful! Retrieved {len(results)} sources.")

    except Exception as e:
        print(f"\n❌ Search failed: {e}")


if __name__ == "__main__":
    asyncio.run(main())