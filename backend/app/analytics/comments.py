
def calculate_comment_activity(previous_snapshot, latest_snapshot):
    previous_comments = previous_snapshot.comments
    latest_comments = latest_snapshot.comments

    if previous_comments is None or latest_comments is None:
        return None

    comments_gained = latest_comments - previous_comments

    time_difference = (
        latest_snapshot.collected_at
        - previous_snapshot.collected_at
    ).total_seconds()

    if time_difference <= 0:
        return None

    return {
        "previous_comments": previous_comments,
        "latest_comments": latest_comments,
        "comments_gained": comments_gained,
        "comments_per_hour": round(
            comments_gained / (time_difference / 3600), 2
        )
    }
