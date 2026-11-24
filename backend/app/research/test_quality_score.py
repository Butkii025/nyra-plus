
from app.research.engine import ResearchEngine


def test_quality_score():
    synthesis = {
        "key_findings": [
            {"verification": {"verification_status": "supported"}},
            {"verification": {"verification_status": "supported"}},
        ],
        "patterns": [
            {"verification": {"verification_status": "partially_supported"}},
        ],
        "contradictions": [
            {"verification": {"verification_status": "unverified"}},
        ],
        "opportunities": [
            {"verification": {"verification_status": "not_checked"}},
        ],
    }

    result = ResearchEngine._calculate_quality_score(synthesis)

    assert result["score"] == 50.0
    assert result["total_claims"] == 5
    assert result["checked_claims"] == 4
    assert result["verification_coverage"] == 80.0

    assert result["status_counts"] == {
        "supported": 2,
        "partially_supported": 1,
        "unverified": 1,
        "not_checked": 1,
    }

    print("Quality score test passed!")
    print(result)


def test_empty_synthesis():
    result = ResearchEngine._calculate_quality_score({})

    assert result["score"] == 0.0
    assert result["total_claims"] == 0
    assert result["verification_coverage"] == 0.0

    print("Empty synthesis test passed!")


if __name__ == "__main__":
    test_quality_score()
    test_empty_synthesis()
    print("\nAll quality score tests passed! ")
