from __future__ import annotations

import os
from typing import Any

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer


class BookieNLPEngine:
    """Runs transparent linguistic analysis over user-provided text."""

    def __init__(self, model_name: str | None = None, prefer_model: bool = True) -> None:
        self.model_name = model_name or os.getenv("SPACY_MODEL", "en_core_web_sm")
        self.model_loaded = False
        self.warnings: list[str] = []

        if prefer_model:
            try:
                self.nlp = spacy.load(self.model_name)
                self.model_loaded = True
            except OSError:
                self.nlp = spacy.blank("en")
                self.warnings.append(
                    f"spaCy model '{self.model_name}' is not installed. "
                    "Tokenisation and sentence segmentation are available; "
                    "POS tagging and NER require the trained model."
                )
        else:
            self.nlp = spacy.blank("en")

        if "sentencizer" not in self.nlp.pipe_names and "parser" not in self.nlp.pipe_names:
            self.nlp.add_pipe("sentencizer")

    @property
    def status(self) -> dict[str, Any]:
        return {
            "model": self.model_name if self.model_loaded else "spacy.blank(en)",
            "trained_model_loaded": self.model_loaded,
            "available_pipelines": list(self.nlp.pipe_names),
        }

    def _extract_keywords(self, sentences: list[str]) -> tuple[list[dict[str, Any]], list[str]]:
        if not sentences:
            return [], []

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=100,
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b",
        )

        try:
            matrix = vectorizer.fit_transform(sentences)
        except ValueError:
            return [], ["There was not enough lexical content to calculate TF-IDF keywords."]

        terms = vectorizer.get_feature_names_out()
        # Aggregate each term's TF-IDF weight across sentences. This is a
        # within-document salience measure, not a corpus-wide IDF statistic.
        scores = matrix.max(axis=0).toarray().ravel()
        ranked = sorted(
            (
                {"word": str(term), "score": round(float(score), 4)}
                for term, score in zip(terms, scores)
            ),
            key=lambda item: (-item["score"], item["word"]),
        )
        warnings: list[str] = []
        if len(sentences) == 1:
            warnings.append(
                "This input contains one sentence. TF-IDF scores are based on a "
                "single-sentence document and should be treated as term salience, "
                "not a comparison against a wider corpus."
            )
        return ranked[:15], warnings

    def analyze(self, text: str) -> dict[str, Any]:
        cleaned_input = text.strip()
        if len(cleaned_input) < 20:
            raise ValueError("Please provide at least 20 characters of text.")

        doc = self.nlp(cleaned_input)
        sentences = [sentence.text.strip() for sentence in doc.sents if sentence.text.strip()]

        tokens = [
            {
                "text": token.text,
                "lemma": token.lemma_ or token.text.lower(),
                "pos": token.pos_ or "UNKNOWN",
                "tag": token.tag_ or "UNKNOWN",
                "is_stop": bool(token.is_stop),
                "is_punctuation": bool(token.is_punct),
                "is_alpha": bool(token.is_alpha),
            }
            for token in doc
            if not token.is_space
        ]

        entities = [
            {
                "text": entity.text,
                "label": entity.label_,
                "description": spacy.explain(entity.label_),
                "start_char": entity.start_char,
                "end_char": entity.end_char,
            }
            for entity in doc.ents
        ]

        keywords, keyword_warnings = self._extract_keywords(sentences)
        warnings = [*self.warnings, *keyword_warnings]

        return {
            "statistics": {
                "characters": len(cleaned_input),
                "words": sum(token.is_alpha for token in doc),
                "sentences": len(sentences),
                "entities": len(entities),
                "tokens": len(tokens),
            },
            "model": {
                "name": self.model_name if self.model_loaded else "spacy.blank(en)",
                "loaded": self.model_loaded,
            },
            "sentences": sentences,
            "tokens": tokens,
            "entities": entities,
            "keywords": keywords,
            "warnings": warnings,
        }
