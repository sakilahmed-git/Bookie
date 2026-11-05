# Bookie — System Architecture

## Product boundaries

- **Next.js frontend:** responsive workspace, source editor, analysis views, document import, study activities, and tutor conversation.
- **FastAPI service:** request validation, upload limits, API contracts, and orchestration.
- **Document loader:** in-memory extraction for TXT, Markdown, PDF, and DOCX.
- **Language analysis engine:** spaCy annotations and scikit-learn TF-IDF keyword extraction.
- **Study pack builder:** extractive revision notes, source-grounded flashcards, and fill-in-the-blank questions.
- **Source tutor:** lexical retrieval over source sentences, with an optional server-side OpenAI-compatible chat completion provider.

## Current flows

### Document ingestion
~~~text
Browser file
  | multipart/form-data
  v
FastAPI upload endpoint
  | 10 MB guard
  v
In-memory format parser (TXT / MD / PDF / DOCX)
  | maximum 50,000 extracted characters
  v
Source editor in the browser
~~~

### Understand and study
~~~text
Source text
  |-- POST /api/v1/analyze --> language analysis --> source insights
  |
  `-- POST /api/v1/study ----> source analysis --> notes / flashcards / quiz
~~~

### Ask Bookie
~~~text
Question + source + bounded conversation history
  |
  v
TF-IDF sentence retrieval
  |
  +--> no relevant evidence --> transparent decline
  |
  `--> relevant passages --> optional LLM explanation --> answer + evidence
~~~

## API

- GET / — service identity
- GET /health — model and tutor configuration status
- POST /api/v1/analyze — inspect text
- POST /api/v1/documents/extract — extract text from an uploaded file
- POST /api/v1/study — generate a source-grounded study pack
- POST /api/v1/tutor — ask a question about the supplied source

## Trust and operational boundaries

- Uploaded bytes are read in memory and are not persisted by the extraction route.
- Upload size is capped at 10 MB; extracted text is capped at 50,000 characters.
- Scanned PDFs are not OCR-processed.
- Retrieval uses TF-IDF lexical similarity, not transformer embeddings.
- Study content is extractive or template-based and should be checked against the source.
- An optional LLM may produce mistaken or incomplete explanations even when supplied with retrieved passages.
- API keys belong on the backend only; never expose them through frontend environment variables.
- The current CORS configuration is local-development oriented and must be deliberately configured for deployment.

## Planned evolution

1. Add a user-controlled, persistent document library.
2. Improve retrieval with evaluated semantic search and passage-level citations.
3. Improve question quality and adaptive revision using human-reviewed evaluation sets.
4. Add OCR and accessible exports.
5. Add authentication, cross-device progress, and collaboration.
6. Add deployment automation, observability, rate limiting, and security review.
