from nlp.engine import BookieNLPEngine


def test_analysis_returns_sentences_tokens_and_statistics() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    result = engine.analyze(
        "Natural language processing helps computers understand text. "
        "Students can use it to explore language patterns."
    )

    assert result["statistics"]["sentences"] == 2
    assert result["statistics"]["words"] > 10
    assert len(result["tokens"]) > 10
    assert len(result["sentences"]) == 2


def test_analysis_rejects_short_text() -> None:
    engine = BookieNLPEngine(prefer_model=False)

    try:
        engine.analyze("Too short")
    except ValueError as error:
        assert "20 characters" in str(error)
    else:
        raise AssertionError("Expected short input to be rejected")


def test_keyword_extraction_returns_ranked_terms() -> None:
    engine = BookieNLPEngine(prefer_model=False)
    result = engine.analyze(
        "Machine learning studies patterns in data. "
        "Machine learning models use data to make predictions."
    )

    assert result["keywords"]
    assert all("word" in item and "score" in item for item in result["keywords"])
