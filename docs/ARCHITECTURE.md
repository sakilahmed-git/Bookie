# Bookie — Initial Architecture

## System boundaries

- **Next.js frontend:** user experience, document input, analysis visualisation, and learning interactions.
- **FastAPI backend:** validation, API contracts, and orchestration of NLP services.
- **NLP engine:** preprocessing, linguistic annotation, feature extraction, semantic operations, transformation, and evaluation.
- **PostgreSQL (planned):** users, documents, processing runs, generated assets, quiz attempts, and evaluation results.

## Initial analysis request

```text
Browser
  |
  | POST /api/v1/analyze { text }
  v
FastAPI validation
  |
  v
BookieNLPEngine
  |-- spaCy: sentence boundaries, tokens, lemmas, POS, entities
  |-- scikit-learn: sentence-level TF-IDF
  v
Structured JSON response
  |
  v
Frontend result tabs: Tokens / Entities / Keywords
```

## API

- `GET /` — service identity and status
- `GET /health` — NLP model and pipeline status
- `POST /api/v1/analyze` — linguistic analysis of text

## Design principles

- Keep the NLP engine independent from FastAPI routes.
- Make intermediate processing results visible for academic demonstration.
- Validate input size and return actionable errors.
- Keep model artifacts out of Git.
- Make expensive transformer models optional until a feature requires them.
- Evaluate generated transformations instead of treating generation as proof of quality.

## Planned evolution

1. Text and linguistic analysis
2. Keyword, topic, and classification tools
3. Understand and Study transformations
4. Quiz and flashcard generation
5. Semantic similarity and knowledge exploration
6. Evaluation and comparative experiments
