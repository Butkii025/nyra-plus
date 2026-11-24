
from app.analytics.percentile import calculate_percentile_scores


def normalize_metrics(metric_data):
    """
    Normalize raw metrics for multiple videos.

    Expected structure:
    {
        1: {
            "growth": 25.5,
            "engagement": 8.2,
            "comment_activity": 12.0,
            "recency": 85.0
        }
    }
    """

    metric_names = [
        "growth",
        "engagement",
        "comment_activity",
        "recency"
    ]

    normalized_results = {
        content_id: {}
        for content_id in metric_data
    }

    for metric in metric_names:

        # Collect one metric across all videos
        values = {
            content_id: metrics.get(metric)
            for content_id, metrics in metric_data.items()
        }

        # Calculate percentile scores
        scores = calculate_percentile_scores(values)

        # Store normalized scores
        for content_id, score in scores.items():
            normalized_results[content_id][metric] = score

    return normalized_results
