from __future__ import annotations

import re
from typing import Any


def build_study_pack(text: str, analysis: dict[str, Any]) -> dict[str, Any]:
    """Create source-grounded revision notes, flashcards, and fill-in-the-blank MCQs."""
    sentences = analysis["sentences"]
    keywords = analysis["keywords"]
    notes = [
        {"number": index + 1, "text": sentence}
        for index, sentence in enumerate(sentences[:12])
    ]

    flashcards: list[dict[str, str]] = []
    quiz: list[dict[str, Any]] = []
    terms = [item["word"] for item in keywords if len(item["word"].split()) <= 3]

    for term in terms:
        matching = next(
            (sentence for sentence in sentences if re.search(
                rf"(?<!\w){re.escape(term)}(?!\w)", sentence, re.IGNORECASE
            )),
            None,
        )
        if matching and len(flashcards) < 10:
            flashcards.append({
                "front": f"What does the source say about “{term}”?",
                "back": matching,
                "term": term,
            })

    for term in terms:
        if len(quiz) >= 5:
            break
        source_sentence = next(
            (sentence for sentence in sentences if re.search(
                rf"(?<!\w){re.escape(term)}(?!\w)", sentence, re.IGNORECASE
            )),
            None,
        )
        if not source_sentence:
            continue
        prompt = re.sub(
            rf"(?<!\w){re.escape(term)}(?!\w)",
            "________",
            source_sentence,
            count=1,
            flags=re.IGNORECASE,
        )
        distractors = [candidate for candidate in terms if candidate.lower() != term.lower()]
        options = [term, *distractors[:3]]
        if len(options) < 2:
            continue
        quiz.append({
            "question": f"Complete the sentence: {prompt}",
            "options": options,
            "answer": term,
            "explanation": f"Your source states: {source_sentence}",
        })

    return {
        "source_statistics": analysis["statistics"],
        "notes": notes,
        "flashcards": flashcards,
        "quiz": quiz,
        "method": "Extractive, source-grounded generation using sentence segmentation and TF-IDF keyword salience.",
        "warnings": [
            "These are extractive study aids, not independently verified explanations."
        ] + (["Not enough distinct keywords were found to build a varied quiz."] if len(quiz) < 3 else []),
    }
