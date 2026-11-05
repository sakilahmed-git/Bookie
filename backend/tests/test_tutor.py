from nlp.tutor import SourceTutor

def test_tutor_returns_source_evidence_for_relevant_question() -> None:
    source = (
        "Photosynthesis is the process by which green plants convert light energy "
        "into chemical energy. Chlorophyll absorbs sunlight in the leaves. "
        "The roots absorb water from the soil."
    )
    result = SourceTutor().answer("How does photosynthesis work?", source)
    assert result["grounded"] is True
    assert result["evidence"]
    assert all(item["sentence"] in source for item in result["evidence"])
    assert "Photosynthesis" in result["answer"]


def test_tutor_declines_when_no_relevant_evidence_exists() -> None:
    source = (
        "Photosynthesis converts light energy into chemical energy. "
        "Chlorophyll absorbs sunlight in plant leaves."
    )
    result = SourceTutor().answer("What is quantum entanglement?", source)
    assert result["evidence"] == []
    assert result["confidence"] == "low"
    assert "could not find" in result["answer"].lower()


def test_tutor_validates_question_and_source() -> None:
    import pytest
    tutor = SourceTutor()
    with pytest.raises(ValueError, match="4 characters"):
        tutor.answer("why", "Photosynthesis converts light energy into chemical energy.")
    with pytest.raises(ValueError, match="20 characters"):
        tutor.answer("Explain this concept", "short")
