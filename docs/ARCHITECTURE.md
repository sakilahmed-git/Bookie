# Bookie — Architecture

## System boundaries

- **Next.js frontend:** workspace, document upload, analysis visualisation, flashcards, and quiz interactions.
- **FastAPI backend:** validation, upload limits, API contracts, and orchestration.
- **Document loader:** in-memory extraction for TXT, Markdown, PDF, and DOCX.
- **NLP engine:** spaCy linguistic annotation and scikit-learn TF-IDF.
- **Study pack builder:** deterministic, extractive revision notes, flashcards, and fill-in-the-blank MCQs.
- **PostgreSQL (planned):** accounts, source documents, processing runs, study packs, and learning progress.

## Current flows

### Document ingestion

~~~text
Browser File
  | multipart/form-data
  v
FastAPI upload endpoint
  | 10 MB guard
  v
In-memory format parser (TXT / MD / PDF / DOCX)
  | max 50,000 extracted characters
  v
Frontend source-text editor
~~~

### Analysis and study

~~~text
Source text
  |-- POST /api/v1/analyze --> spaCy + TF-IDF --> token/entity/keyword results
  |
  `-- POST /api/v1/study ----> NLP analysis --> source-grounded notes/cards/quiz
~~~

## API

- GET / — service identity
- GET /health — model and pipeline status
- POST /api/v1/analyze — linguistic analysis
- POST /api/v1/documents/extract — document text extraction
- POST /api/v1/study — source-grounded study pack generation

## Trust and safety boundaries

- Uploaded bytes are read in memory and are not persisted.
- Upload size is capped at 10 MB; extracted text is capped at 50,000 characters.
- Only explicit file extensions are accepted; scanned PDFs are not OCR'd.
- Study material is extractive and always exposes its source sentence. It is not represented as a verified explanation.
- Model files and user documents must not be committed to the repository.

## Planned evolution

1. Add OCR with an explicit opt-in for scanned PDFs.
2. Improve concept selection and distractor quality; evaluate against human-authored study sets.
3. Add semantic similarity and topic modelling.
4. Add persisted document libraries and user progress.
5. Add generative explanations with citations to source spans and evaluation.
