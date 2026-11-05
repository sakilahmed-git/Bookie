from io import BytesIO

import pytest

from nlp.document_loader import extract_document_text
from nlp.engine import BookieNLPEngine
from nlp.study import build_study_pack


def test_analysis_returns_sentences_tokens_and_statistics() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    result = engine.analyze(
        "Natural language processing helps computers understand text. "
        "Students can use it to explore language patterns."
    )
    assert result["statistics"]["sentences"] == 2
    assert result["statistics"]["words"] > 10
    assert len(result["tokens"]) > 10


def test_analysis_rejects_short_text() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    with pytest.raises(ValueError, match="20 characters"):
        engine.analyze("Too short")


def test_keyword_extraction_returns_ranked_terms() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    result = engine.analyze(
        "Machine learning studies patterns in data. "
        "Machine learning models use data to make predictions."
    )
    assert result["keywords"]
    assert all("word" in item and "score" in item for item in result["keywords"])


def test_text_document_extraction() -> None:
    source = b"Natural language processing transforms text into useful structured information."
    assert "structured information" in extract_document_text("notes.txt", source)


def test_unsupported_document_type_is_rejected() -> None:
    with pytest.raises(ValueError, match="Unsupported format"):
        extract_document_text("notes.exe", b"not a document")


def test_study_pack_is_grounded_in_source_sentences() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    source = (
        "Machine learning studies patterns in data. "
        "Machine learning models use data to make predictions. "
        "Natural language processing analyses human language."
    )
    result = build_study_pack(source, engine.analyze(source))
    assert result["notes"]
    assert result["concepts"]
    assert all(note["text"] in source for note in result["notes"])
    assert all(concept["context"] in source for concept in result["concepts"])
    assert result["flashcards"]
    assert all(card["back"] in source for card in result["flashcards"])
    assert all(question["source_sentence"] in source for question in result["quiz"])


def test_study_pack_difficulty_changes_question_count() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    source = (
        "Machine learning studies patterns in data. "
        "Machine learning models use data to make predictions. "
        "Natural language processing analyses human language. "
        "Language models transform information into useful outputs."
    )
    analysis = engine.analyze(source)
    beginner = build_study_pack(source, analysis, "beginner")
    advanced = build_study_pack(source, analysis, "advanced")
    assert beginner["difficulty"] == "beginner"
    assert advanced["difficulty"] == "advanced"
    assert len(advanced["quiz"]) >= len(beginner["quiz"])


def test_study_pack_rejects_unknown_difficulty() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    source = "Machine learning studies patterns in data. It can help analyse information."
    with pytest.raises(ValueError, match="Difficulty"):
        build_study_pack(source, engine.analyze(source), "expert")
