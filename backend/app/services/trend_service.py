
from sqlalchemy.orm import Session

from app.models.content import ContentItem, MetricSnapshot

from app.analytics.growth import calculate_growth
from app.analytics.engagement import calculate_engagement
from app.analytics.comments import calculate_comment_activity
from app.analytics.recency import calculate_recency
from app.analytics.normalization import normalize_metrics
from app.analytics.trend_score import calculate_trend_score


def generate_trend_rankings(db: Session):

    # 1. Fetch YouTube videos from PostgreSQL
    videos = (
        db.query(ContentItem)
        .filter(ContentItem.platform == "youtube")
        .all()
    )

    raw_metrics = {}
    video_details = {}

    # 2. Calculate raw metrics for every video
    for video in videos:

        snapshots = (
            db.query(MetricSnapshot)
            .filter(MetricSnapshot.content_id == video.id)
            .order_by(MetricSnapshot.collected_at.desc())
            .limit(2)
            .all()
        )

        if not snapshots:
            continue

        latest = snapshots[0]
        previous = snapshots[1] if len(snapshots) > 1 else None

        growth = None
        comments = None

        if previous is not None:
            growth = calculate_growth(previous, latest)
            comments = calculate_comment_activity(previous, latest)

        engagement = calculate_engagement(latest)
        recency = calculate_recency(video.published_at)

        raw_metrics[video.id] = {
            "growth": (
                growth["growth_rate_percent"]
                if growth else None
            ),
            "engagement": (
                engagement["engagement_rate_percent"]
                if engagement else None
            ),
            "comment_activity": (
                comments["comments_per_hour"]
                if comments else None
            ),
            "recency": (
                recency["recency_score"]
                if recency else None
            )
        }

        video_details[video.id] = {
            "content_id": video.id,
            "title": video.title,
            "channel_name": video.channel_name,
            "video_url": video.video_url,
            "latest_views": latest.views,
            "latest_likes": latest.likes,
            "latest_comments": latest.comments
        }

    # 3. Normalize metrics across the video collection
    normalized_metrics = normalize_metrics(raw_metrics)

    # 4. Calculate the final Trend Score
    rankings = []

    for video_id, components in normalized_metrics.items():

        score_result = calculate_trend_score({
            **components,
            "cross_source": None
        })

        result = {
            **video_details[video_id],
            "raw_metrics": raw_metrics[video_id],
            "normalized_metrics": components,
            "trend_score": score_result["trend_score"],
            "data_coverage_percent": score_result["confidence"],
            "algorithm_version": score_result["algorithm_version"]
        }

        rankings.append(result)

    # 5. Rank highest-scoring videos first
    rankings.sort(
        key=lambda item: (
            item["trend_score"] is None,
            -(item["trend_score"] or 0)
        )
    )

    return rankings
