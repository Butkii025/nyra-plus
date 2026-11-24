import re
from collections import Counter


class IntelligenceAnalyzer:

    STOPWORDS = {
        "the", "and", "for", "are", "but", "not", "you", "your",
        "with", "from", "this", "that", "was", "were", "have", "has",
        "had", "will", "would", "can", "could", "should", "their",
        "they", "them", "its", "our", "about", "into", "than",
        "then", "when", "where", "what", "which", "who", "how",
        "why", "all", "any", "each", "other", "more", "most",
        "some", "such", "also", "just", "only", "over", "under",
        "after", "before", "between", "while", "during", "through",
        "being", "been", "very", "much", "many", "make", "made",
        "get", "got", "new", "use", "used", "using", "based",
        "like", "one", "two", "first", "last", "next", "well",
        "data", "source", "sources", "website", "content", "http",
        "https", "www", "com"
    }

    def analyze(self, findings: list[str]) -> dict:
        """
        Performs lightweight deterministic analysis
        on collected research evidence.
        """

        if not findings:
            return {
                "total_sources": 0,
                "total_words": 0,
                "total_characters": 0,
                "top_keywords": [],
                "analysis_status": "no_evidence"
            }

        combined_text = " ".join(findings).lower()

        # Extract alphabetic words
        words = re.findall(r"\b[a-z]{3,}\b", combined_text)

        # Remove common stopwords
        meaningful_words = [
            word for word in words
            if word not in self.STOPWORDS
        ]

        # Calculate keyword frequency
        keyword_counts = Counter(meaningful_words)

        # Extract the most frequent keywords
        top_keywords = [
            {
                "keyword": word,
                "frequency": count
            }
            for word, count in keyword_counts.most_common(15)
        ]

        return {
            "total_sources": len(findings),
            "total_words": len(words),
            "total_characters": len(combined_text),
            "top_keywords": top_keywords,
            "analysis_status": "success"
        }