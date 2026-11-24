
from math import isfinite

WEIGHTS = {
    "growth": 0.35,
    "engagement": 0.25,
    "comment_activity": 0.15,
    "recency": 0.15,
    "cross_source": 0.10
}


def calculate_trend_score(components):
    available = {}

    for name, value in components.items():

        if name not in WEIGHTS or value is None:
            continue

        if not isinstance(value, (int, float)) or not isfinite(value):
            raise ValueError(f"Invalid score for {name}")

        if not 0 <= value <= 100:
            raise ValueError(f"{name} must be between 0 and 100")

        available[name] = value

    if not available:
        return {
            "trend_score": None,
            "confidence": 0,
            "components_used": [],
            "algorithm_version": "1.0"
        }

    available_weight = sum(
        WEIGHTS[name] for name in available
    )

    score = sum(
        value * WEIGHTS[name]
        for name, value in available.items()
    ) / available_weight

    return {
        "trend_score": round(score, 2),
        "confidence": round(available_weight * 100, 2),
        "components_used": list(available.keys()),
        "algorithm_version": "1.0"
    }
