from app.processing.normalize import normalize_youtube_video
from sqlalchemy.orm import Session

from app.models.content import ContentItem, MetricSnapshot
from app.schemas.content import ContentRecord


def save_content(db: Session, record: ContentRecord):
    try:
        # 1. Check whether this video already exists.
        content = (
            db.query(ContentItem)
            .filter(
                ContentItem.platform == record.platform,
                ContentItem.external_id == record.video_id
            )
            .first()
        )

        # 2. Create a new content record or update its details.
        if content is None:
            content = ContentItem(
                platform=record.platform,
                external_id=record.video_id,
                title=record.title,
                channel_name=record.channel_name,
                description=record.description,
                video_url=record.video_url,
                thumbnail_url=record.thumbnail_url,
                published_at=record.published_at,
            )
            db.add(content)
            db.flush()
        else:
            content.title = record.title
            content.channel_name = record.channel_name
            content.description = record.description
            content.video_url = record.video_url
            content.thumbnail_url = record.thumbnail_url
            content.published_at = record.published_at

        # 3. Save a fresh metrics snapshot.
        snapshot = MetricSnapshot(
            content_id=content.id,
            views=record.views,
            likes=record.likes,
            comments=record.comments,
        )
        db.add(snapshot)

        # 4. Commit both changes together.
        db.commit()
        db.refresh(content)

        return content.id

    except Exception:
        db.rollback()
        raise



from app.connectors.youtube import get_video_statistics


async def refresh_existing_content(db: Session):
    # Get existing YouTube videos from PostgreSQL
    existing_videos = (
        db.query(ContentItem)
        .filter(ContentItem.platform == "youtube")
        .all()
    )

    video_ids = [video.external_id for video in existing_videos]

    if not video_ids:
        return 0

    # YouTube API accepts up to 50 video IDs per request
    updated_count = 0

    for start in range(0, len(video_ids), 50):
        batch_ids = video_ids[start:start + 50]

        latest_videos = await get_video_statistics(batch_ids)

        for video in latest_videos:
            record = normalize_youtube_video(video)
            save_content(db, record)
            updated_count += 1

    return updated_count
