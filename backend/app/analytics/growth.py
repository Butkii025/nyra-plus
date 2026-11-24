
from datetime import datetime


def calculate_growth(previous_snapshot, latest_snapshot):
    """
    Calculate view growth between two metric snapshots.
    """

    previous_views = previous_snapshot.views
    latest_views = latest_snapshot.views

    # Growth cannot be calculated if views are missing.
    if previous_views is None or latest_views is None:
        return None

    # Avoid division by zero.
    if previous_views <= 0:
        return None

    # Calculate percentage growth.
    growth_rate = (
        (latest_views - previous_views)
        / previous_views
    ) * 100

    # Calculate the time between snapshots.
    time_difference = (
        latest_snapshot.collected_at
        - previous_snapshot.collected_at
    ).total_seconds()

    if time_difference <= 0:
        return None

    # Convert growth into an hourly rate.
    hours = time_difference / 3600

    hourly_growth = growth_rate / hours

    return {
        "previous_views": previous_views,
        "latest_views": latest_views,
        "views_gained": latest_views - previous_views,
        "growth_rate_percent": round(growth_rate, 2),
        "hourly_growth_percent": round(hourly_growth, 2),
        "time_difference_hours": round(hours, 2)
    }
