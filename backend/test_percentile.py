
from app.analytics.percentile import calculate_percentile_scores

sample_data = {
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500
}

result = calculate_percentile_scores(sample_data)

print("Percentile Scores:")

for video_id, score in result.items():
    print(f"Video {video_id}: {score}")
