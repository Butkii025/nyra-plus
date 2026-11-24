
def calculate_engagement(snapshot):
    """
    Calculate engagement rate using available likes and comments.
    Formula: (likes + comments) / views * 100
    """

    views = snapshot.views
    likes = snapshot.likes
    comments = snapshot.comments

    # Views are required for the calculation.
    if views is None or views <= 0:
        return None

    # Do not treat unavailable metrics as zero.
    if likes is None and comments is None:
        return None

    # Use only metrics that are available.
    interactions = 0

    if likes is not None:
        interactions += likes

    if comments is not None:
        interactions += comments

    engagement_rate = (interactions / views) * 100

    return {
        "views": views,
        "likes": likes,
        "comments": comments,
        "available_interactions": interactions,
        "engagement_rate_percent": round(engagement_rate, 2)
    }
