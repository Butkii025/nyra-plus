from app.analytics.trend_score import calculate_trend_score

sample_components = {
    "growth": 90,
    "engagement": 80,
    "comment_activity": 70,
    "recency": 100,
    "cross_source": None
}

result = calculate_trend_score(sample_components)

print(result)