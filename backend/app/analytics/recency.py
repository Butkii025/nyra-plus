
from datetime import datetime, timezone


def calculate_recency(published_at):
    if published_at is None:
        return None

    now = datetime.now(timezone.utc)

    if published_at.tzinfo is None:
        published_at = published_at.replace(tzinfo=timezone.utc)

    age_hours = (now - published_at).total_seconds() / 3600

    if age_hours < 0:
        return None

    # Exponential decay: score decreases as content gets older.
    score = 100 * (0.5 ** (age_hours / 24))

    return {
        "age_hours": round(age_hours, 2),
        "recency_score": round(score, 2)
    }
