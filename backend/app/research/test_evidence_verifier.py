from app.research.evidence_verifier import verify_evidence


def test_supported_claim():
    claim = "AI agents automate code testing and bug detection"

    evidence = """
    AI coding agents can run automated tests, identify software bugs,
    and assist developers with debugging code.
    """

    result = verify_evidence(claim, evidence)

    print("\nSUPPORTED TEST:", result.model_dump())

    assert result.verification_status == "supported"


def test_partially_supported_claim():
    claim = "AI agents automate code testing, bug detection, deployment, and security"

    evidence = """
    AI agents can automate code testing and assist with bug detection.
    """

    result = verify_evidence(claim, evidence)

    print("\nPARTIAL TEST:", result.model_dump())

    assert result.verification_status == "partially_supported"


def test_unverified_claim():
    claim = "Quantum computers revolutionize underwater agriculture"

    evidence = """
    AI agents help developers write code, review pull requests,
    and automate software testing.
    """

    result = verify_evidence(claim, evidence)

    print("\nUNVERIFIED TEST:", result.model_dump())

    assert result.verification_status == "unverified"


def test_empty_evidence():
    claim = "AI agents improve software development"

    result = verify_evidence(claim, "")

    print("\nEMPTY TEST:", result.model_dump())

    assert result.verification_status == "not_checked"
    assert result.verification_confidence is None


if __name__ == "__main__":
    test_supported_claim()
    test_partially_supported_claim()
    test_unverified_claim()
    test_empty_evidence()

    print("\nAll evidence verifier tests passed! ✅")
    