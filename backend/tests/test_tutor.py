import httpx
import pytest

from nlp.tutor import SourceTutor

SOURCE = (
    "Photosynthesis is the process by which green plants convert light energy "
    "into chemical energy. Chlorophyll absorbs sunlight in the leaves. "
    "The roots absorb water from the soil."
)


def test_tutor_returns_source_evidence_for_relevant_question() -> None:
    result = SourceTutor().answer("How does photosynthesis work?", SOURCE)
    assert result["grounded"] is True
    assert result["evidence"]
    assert all(item["sentence"] in SOURCE for item in result["evidence"])
    assert "Photosynthesis" in result["answer"]


def test_tutor_declines_when_no_relevant_evidence_exists() -> None:
    result = SourceTutor().answer("What is quantum entanglement?", SOURCE)
    assert result["evidence"] == []
    assert result["confidence"] == "low"
    assert "could not find" in result["answer"].lower()


def test_tutor_validates_question_source_and_level() -> None:
    tutor = SourceTutor()
    with pytest.raises(ValueError, match="4 characters"):
        tutor.answer("why", SOURCE)
    with pytest.raises(ValueError, match="20 characters"):
        tutor.answer("Explain this concept", "short")
    with pytest.raises(ValueError, match="Level"):
        tutor.answer("Explain photosynthesis", SOURCE, "expert")


def test_llm_tutor_uses_evidence_level_and_history(monkeypatch) -> None:
    tutor = SourceTutor()
    tutor.api_key = "test-key"
    captured = {}

    def fake_explain(question, evidence, level, history):
        captured.update(question=question, evidence=evidence, level=level, history=history)
        return "Plants convert light energy into chemical energy [1]."

    monkeypatch.setattr(tutor, "_explain_with_llm", fake_explain)
    result = tutor.answer(
        "Explain photosynthesis", SOURCE, "beginner",
        [{"role": "user", "content": "What does the plant absorb?"}],
    )
    assert result["mode"] == "llm-grounded"
    assert result["grounded"] is True
    assert result["answer"].endswith("[1].")
    assert captured["level"] == "beginner"
    assert captured["evidence"]
    assert captured["history"][0]["role"] == "user"


def test_llm_failure_falls_back_to_source_passages(monkeypatch) -> None:
    tutor = SourceTutor()
    tutor.api_key = "test-key"

    def fail(*args, **kwargs):
        raise httpx.ConnectError("offline")

    monkeypatch.setattr(tutor, "_explain_with_llm", fail)
    result = tutor.answer("Explain photosynthesis", SOURCE)
    assert result["mode"] == "retrieval-fallback"
    assert result["evidence"]
    assert "unavailable" in result["message"]


def test_llm_request_uses_configured_model_and_retrieved_passages(monkeypatch) -> None:
    tutor = SourceTutor()
    tutor.api_key = "test-key"
    tutor.model = "bookie-test-model"
    tutor.base_url = "https://llm.example/v1"
    captured = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "Chlorophyll absorbs sunlight [2]."}}]}

    def fake_post(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return FakeResponse()

    monkeypatch.setattr("nlp.tutor.httpx.post", fake_post)
    result = tutor.answer("What does chlorophyll do?", SOURCE, "advanced")
    assert result["mode"] == "llm-grounded"
    assert captured["url"] == "https://llm.example/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["json"]["model"] == "bookie-test-model"
    assert "Chlorophyll absorbs sunlight" in captured["json"]["messages"][-1]["content"]
