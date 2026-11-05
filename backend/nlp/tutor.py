from __future__ import annotations

import re
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SourceTutor:
    """Answers questions by retrieving and explaining evidence from a supplied source."""

    def __init__(self, max_context_sentences: int = 3) -> None:
        self.max_context_sentences = max_context_sentences

    def answer(self, question: str, source_text: str) -> dict[str, Any]:
        query = question.strip()
        source = source_text.strip()
        if len(query) < 4:
            raise ValueError("Ask a question with at least 4 characters.")
        if len(source) < 20:
            raise ValueError("Provide at least 20 characters of source material.")

        sentences = [
            part.strip()
            for part in re.split(r"(?<=[.!?])\s+|\n+", source)
            if len(part.strip()) >= 12
        ]
        if not sentences:
            raise ValueError("No usable sentences were found in the source.")

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b",
        )
        try:
            matrix = vectorizer.fit_transform([query, *sentences])
            scores = cosine_similarity(matrix[0:1], matrix[1:]).ravel()
        except ValueError:
            scores = [0.0] * len(sentences)

        ranked = sorted(
            enumerate(scores),
            key=lambda item: (-float(item[1]), item[0]),
        )
        selected = [
            (index, float(score))
            for index, score in ranked[: self.max_context_sentences]
            if float(score) > 0
        ]
        if not selected:
            return {
                "answer": (
                    "I could not find a sufficiently relevant passage in the supplied "
                    "material. Try using a key term from your notes or asking a more "
                    "specific question."
                ),
                "evidence": [],
                "confidence": "low",
                "mode": "retrieval",
                "grounded": True,
                "message": "No matching source evidence was found; no answer was invented.",
            }

        evidence = [
            {
                "sentence": sentences[index],
                "source_sentence": index + 1,
                "relevance": round(score, 4),
            }
            for index, score in selected
        ]
        best_score = selected[0][1]
        confidence = "high" if best_score >= 0.35 else "medium" if best_score >= 0.12 else "low"
        answer = " ".join(item["sentence"] for item in evidence)
        return {
            "answer": answer,
            "evidence": evidence,
            "confidence": confidence,
            "mode": "retrieval",
            "grounded": True,
            "message": (
                "This response is assembled from the closest matching sentences in "
                "your source. It is not a newly generated explanation."
            ),
        }
