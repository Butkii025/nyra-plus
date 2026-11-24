
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")

BASE_URL = "https://www.googleapis.com/youtube/v3"


async def search_videos(query="technology", region="IN"):
    if not API_KEY:
        raise RuntimeError("YouTube API key is missing")

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "regionCode": region,
        "maxResults": 10,
        "order": "date",
        "key": API_KEY
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{BASE_URL}/search",
            params=params
        )
        response.raise_for_status()
        return response.json()


async def get_video_statistics(video_ids):
    if not video_ids:
        return []

    params = {
        "part": "snippet,statistics,contentDetails",
        "id": ",".join(video_ids),
        "key": API_KEY
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{BASE_URL}/videos",
            params=params
        )
        response.raise_for_status()
        return response.json().get("items", [])
