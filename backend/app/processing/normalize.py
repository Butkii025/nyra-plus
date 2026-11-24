
from app.schemas.content import ContentRecord


def normalize_youtube_video(video):

    snippet = video.get("snippet", {})
    statistics = video.get("statistics", {})

    video_id = video.get("id")

    thumbnails = snippet.get("thumbnails", {})
    thumbnail = (
        thumbnails.get("high")
        or thumbnails.get("medium")
        or thumbnails.get("default")
        or {}
    )

    return ContentRecord(
        platform="youtube",
        video_id=video_id,
        title=snippet.get("title", "Untitled"),
        channel_name=snippet.get("channelTitle", "Unknown"),
        description=snippet.get("description"),
        published_at=snippet.get("publishedAt"),
        video_url=f"https://www.youtube.com/watch?v={video_id}",
        thumbnail_url=thumbnail.get("url"),
        views=int(statistics["viewCount"])
            if "viewCount" in statistics else None,
        likes=int(statistics["likeCount"])
            if "likeCount" in statistics else None,
        comments=int(statistics["commentCount"])
            if "commentCount" in statistics else None,
        category=snippet.get("categoryId")
    )
