
from sqlalchemy.orm import Session

from app.models.content import ContentItem, MetricSnapshot
from app.analytics.growth import calculate_growth
from app.analytics.engagement import calculate_engagement
from app.analytics.comments import calculate_comment_activity
from app.analytics.recency import calculate_recency


def get_content_analytics(db: Session, content_id: int):

    # 1. Find the video
    content = (
        db.query(ContentItem)
        .filter(ContentItem.id == content_id)
        .first()
    )

    if content is None:
        return None

    # 2. Fetch its two latest metric snapshots
    snapshots = (
        db.query(MetricSnapshot)
        .filter(MetricSnapshot.content_id == content_id)
        .order_by(MetricSnapshot.collected_at.desc())
        .limit(2)
        .all()
    )

    if not snapshots:
        return {
            "content_id": content.id,
            "title": content.title,
            "message": "No metric snapshots available"
        }

    latest = snapshots[0]
    previous = snapshots[1] if len(snapshots) > 1 else None

    # 3. Calculate analytics
    engagement = calculate_engagement(latest)
    recency = calculate_recency(content.published_at)

    growth = None
    comment_activity = None

    if previous is not None:
        growth = calculate_growth(previous, latest)
        comment_activity = calculate_comment_activity(
            previous, latest
        )

    # 4. Return the analytics report
    return {
        "content_id": content.id,
        "title": content.title,
        "platform": content.platform,
        "video_url": content.video_url,
        "latest_metrics": {
            "views": latest.views,
            "likes": latest.likes,
            "comments": latest.comments,
            "collected_at": latest.collected_at
        },
        "growth": growth,
        "engagement": engagement,
        "comment_activity": comment_activity,
        "recency": recency
    }
