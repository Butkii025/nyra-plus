import re
from typing import Any

from app.research.schemas import EvidenceVerification


STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "of", "to", "in", "on", "for", "and", "or", "with",
    "as", "by", "at", "from", "that", "this", "it", "its", "their",
    "they", "them", "we", "our", "can", "could", "will", "would",
    "may", "might", "has", "have", "had", "do", "does", "did",
    "about", "into", "more", "most", "some", "many", "which", "who",
    "what", "how", "than", "also", "such", "using", "used"
}


def tokenize(text: str) -> set[str]:
    words = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())

    normalized_words = set()

    for word in words:
        if len(word) <= 2 or word in STOP_WORDS:
            continue

        # Normalize common word variations
        if word.endswith("ing") and len(word) > 5:
            word = word[:-3]
        elif word.endswith("ed") and len(word) > 4:
            word = word[:-2]
        elif word.endswith("ies") and len(word) > 4:
            word = word[:-3] + "y"
        elif word.endswith("s") and len(word) > 3:
            word = word[:-1]

        # Handle common variations
        word_map = {
            "automat": "automate",
            "automati": "automate",
            "detect": "detection",
            "identifi": "identify",
        }

        word = word_map.get(word, word)

        normalized_words.add(word)

    return normalized_words


def verify_evidence(
    claim: str,
    evidence_text: str
) -> EvidenceVerification:

    if not claim.strip() or not evidence_text.strip():
        return EvidenceVerification(
            verification_status="not_checked",
            evidence_excerpt="",
            verification_confidence=None
        )

    claim_words = tokenize(claim)
    evidence_words = tokenize(evidence_text)

    if not claim_words or not evidence_words:
        return EvidenceVerification(
            verification_status="not_checked",
            evidence_excerpt="",
            verification_confidence=None
        )

    matched_words = claim_words.intersection(evidence_words)

    match_ratio = len(matched_words) / len(claim_words)

    if match_ratio >= 0.80:
        status = "supported"
    elif match_ratio >= 0.30:
        status = "partially_supported"
    else:
        status = "unverified"

    excerpt = evidence_text[:500].strip()

    return EvidenceVerification(
        verification_status=status,
        evidence_excerpt=excerpt,
        verification_confidence=round(match_ratio, 2)
    )