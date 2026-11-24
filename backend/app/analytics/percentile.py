
def calculate_percentile_scores(values):
    """
    Convert raw metric values into percentile scores (0-100).

    values: Dictionary containing:
        {content_id: raw_metric_value}

    Returns:
        {content_id: percentile_score}
    """

    # Ignore missing values
    valid_values = {
        content_id: value
        for content_id, value in values.items()
        if value is not None
    }

    # Need at least two videos for comparison
    if len(valid_values) < 2:
        return {
            content_id: None
            for content_id in values
        }

    sorted_values = sorted(valid_values.values())
    total = len(sorted_values)

    scores = {}

    for content_id, value in values.items():

        if value is None:
            scores[content_id] = None
            continue

        # Find the positions of all tied values
        positions = [
            index
            for index, item in enumerate(sorted_values)
            if item == value
        ]

        # Average rank handles tied values fairly
        average_rank = sum(positions) / len(positions)

        # Convert rank into a 0-100 percentile
        percentile = (average_rank / (total - 1)) * 100

        scores[content_id] = round(percentile, 2)

    return scores
