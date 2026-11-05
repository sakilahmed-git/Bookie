from __future__ import annotations

import re
from typing import Any

DIFFICULTY_COUNTS = {"beginner": 3, "intermediate": 5, "advanced": 8}


def _contains_term(sentence: str, term: str) -> bool:
    return bool(re.search(rf"(?<!\w){re.escape(term)}(?!\w)", sentence, re.IGNORECASE))


def build_study_pack(
    text: str, analysis: dict[str, Any], difficulty: str = "intermediate"
) -> dict[str, Any]:
    """Build transparent, source-grounded study material with adjustable challenge."""
    level = difficulty.lower().strip()
    if level not in DIFFICULTY_COUNTS:
        raise ValueError("Difficulty must be beginner, intermediate, or advanced.")

    sentences = analysis["sentences"]
    keywords = analysis["keywords"]
    terms = [
        item["word"] for item in keywords
        if len(item["word"].split()) <= 3 and len(item["word"]) >= 3
    ]
    concepts: list[dict[str, str]] = []
    flashcards: list[dict[str, str]] = []
    quiz: list[dict[str, Any]] = []

    for term in terms:
        source = next((s for s in sentences if _contains_term(s, term)), None)
        if not source:
            continue
        concepts.append({
            "term": term,
            "context": source,
            "study_hint": (
                f"Focus on how “{term}” is used in this sentence. "
                "Connect the term to the action or idea described by the source."
            ),
        })
        flashcards.append({
            "front": f"How is “{term}” used in this source?",
            "back": source,
            "term": term,
        })
        if len(concepts) >= 8:
            break

    for term in terms:
        if len(quiz) >= DIFFICULTY_COUNTS[level]:
            break
        source = next((s for s in sentences if _contains_term(s, term)), None)
        if not source:
            continue
        prompt = re.sub(
            rf"(?<!\w){re.escape(term)}(?!\w)",
            "________",
            source,
            count=1,
            flags=re.IGNORECASE,
        )
        distractors = [candidate for candidate in terms if candidate.lower() != term.lower()]
        options = [term, *distractors[:3]]
        if len(options) < 2:
            continue
        quiz.append({
            "question": f"Complete the source statement: {prompt}",
            "options": options,
            "answer": term,
            "explanation": f"The source sentence is: {source}",
            "source_sentence": source,
            "difficulty": level,
        })

    return {
        "source_statistics": analysis["statistics"],
        "difficulty": level,
        "concepts": concepts,
        "notes": [
            {"number": index + 1, "text": sentence}
            for index, sentence in enumerate(sentences[:12])
        ],
        "flashcards": flashcards[:10],
        "quiz": quiz,
        "progress_model": "Session progress is stored locally by the browser; source text is not uploaded for progress tracking.",
        "method": (
            "Concepts and questions are selected from source sentences using "
            "spaCy sentence segmentation and within-document TF-IDF term salience. "
            "Distractors are other terms found in the same source."
        ),
        "warnings": [
            "Study hints are prompts for reflection, not generated factual definitions.",
            "Quiz distractors are source terms and may not be equally plausible in every context.",
            "This version does not use a transformer or independently verify source claims.",
        ],
    }
