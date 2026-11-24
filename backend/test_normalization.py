
from app.analytics.normalization import normalize_metrics

sample_data = {
    1: {
        "growth": 100,
        "engagement": 5,
        "comment_activity": 10,
        "recency": 30
    },
    2: {
        "growth": 300,
        "engagement": 10,
        "comment_activity": 20,
        "recency": 60
    },
    3: {
        "growth": 500,
        "engagement": 15,
        "comment_activity": 30,
        "recency": 90
    }
}

result = normalize_metrics(sample_data)

for video_id, scores in result.items():
    print(f"\nVideo {video_id}")
    print(scores)
