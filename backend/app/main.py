from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.connectors.youtube import (
    search_videos,
    get_video_statistics
)

from app.processing.normalize import normalize_youtube_video

from app.services.content_service import (
    save_content,
    refresh_existing_content
)

from app.services.trend_service import generate_trend_rankings
from app.services.analytics_service import get_content_analytics

from app.research.routes import router as research_router


# =========================================================
# APPLICATION INITIALIZATION
# =========================================================

app = FastAPI(
    title="NYRA PLUS",
    description="AI-Powered Trend Intelligence Platform",
    version="1.0.0"
)

# Register research module
app.include_router(research_router)


# =========================================================
# BASIC ROUTES
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to NYRA PLUS",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================================================
# YOUTUBE SEARCH
# =========================================================

@app.get("/api/youtube/search")
async def youtube_search(
    q: str = "technology",
    region: str = "IN"
):
    try:
        results = await search_videos(q, region)

        video_ids = [
            item["id"]["videoId"]
            for item in results.get("items", [])
            if item.get("id", {}).get("videoId")
        ]

        videos = await get_video_statistics(video_ids)

        normalized_videos = [
            normalize_youtube_video(video)
            for video in videos
        ]

        return {
            "platform": "youtube",
            "count": len(normalized_videos),
            "videos": normalized_videos
        }

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="YouTube data retrieval failed"
        )


# =========================================================
# YOUTUBE DATA COLLECTION
# =========================================================

@app.post("/youtube/collect")
async def collect_youtube_data(
    db: Session = Depends(get_db)
):
    try:
        # Fetch YouTube videos
        search_result = await search_videos(
            query="technology",
            region="IN"
        )

        video_ids = [
            item["id"]["videoId"]
            for item in search_result.get("items", [])
            if item.get("id", {}).get("videoId")
        ]

        # Fetch detailed statistics
        videos = await get_video_statistics(video_ids)

        # Normalize and save
        saved_ids = []

        for video in videos:
            record = normalize_youtube_video(video)
            content_id = save_content(db, record)
            saved_ids.append(content_id)

        return {
            "status": "success",
            "message": "YouTube data saved to NYRA PLUS database",
            "videos_collected": len(saved_ids),
            "database_content_ids": saved_ids
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube collection failed: {str(error)}"
        )


# =========================================================
# YOUTUBE DATA REFRESH
# =========================================================

@app.post("/youtube/refresh")
async def refresh_youtube_data(
    db: Session = Depends(get_db)
):
    try:
        count = await refresh_existing_content(db)

        return {
            "status": "success",
            "message": "Existing YouTube videos refreshed",
            "snapshots_created": count
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Refresh failed: {str(error)}"
        )


# =========================================================
# CONTENT ANALYTICS
# =========================================================

@app.get("/analytics/{content_id}")
def get_video_analytics(
    content_id: int,
    db: Session = Depends(get_db)
):
    result = get_content_analytics(db, content_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return result


# =========================================================
# TREND RANKINGS
# =========================================================

@app.get("/trends")
def get_trending_videos(
    db: Session = Depends(get_db)
):
    try:
        rankings = generate_trend_rankings(db)

        return {
            "status": "success",
            "total_videos": len(rankings),
            "algorithm": "NYRA Trend Score v1.0",
            "trending_videos": rankings
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Trend calculation failed: {str(error)}"
        )