# bookie.

**Understand it. Transform it. Master it.**

Bookie is an NLP-powered content transformation and learning platform. Bring your notes, articles, or documents and turn them into inspectable language analysis and source-grounded study material.

> Course project: **CSE472 — Natural Language Processing**  
> Project title: **P26 — Automated Content Transformation Platform**

## Product experience

- **Understand:** inspect language patterns and important concepts.
- **Study:** extract revision notes, flip-through flashcards, and knowledge checks.
- **Play:** practise with short challenges (planned).
- **Explore:** discover entities, topics, and semantic relationships (planned).
- **Create:** repurpose source material into useful content (planned).

## Current MVP

### Document ingestion
- Upload UTF-8 TXT, Markdown, PDF, or DOCX.
- 10 MB upload limit; extracted text is capped at 50,000 characters.
- PDF and DOCX are parsed in memory; uploads are not written to disk.
- Scanned/image-only PDFs need OCR and are not supported yet.

### NLP laboratory
- Sentence segmentation and tokenisation
- Lemmas, POS tags, fine-grained tags, and stop-word flags
- Named entity recognition
- Sentence-level TF-IDF keyword salience
- Document statistics and model availability information

### Study workspace
- Revision notes made from original source sentences
- Flashcards whose answers quote the source
- Fill-in-the-blank multiple-choice questions based on source sentences
- Immediate answer feedback and score

Study pack generation is extractive and deterministic in this MVP. It does not claim to produce independently verified explanations or pedagogically validated questions. TF-IDF scores are within-document salience, not corpus-wide importance.

## Repository structure

~~~text
bookie/
├── backend/
│   ├── nlp/
│   │   ├── document_loader.py
│   │   ├── engine.py
│   │   └── study.py
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── src/app/
└── docs/
~~~

## Getting started

### Backend (Python 3.12 recommended)

~~~powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn main:app --reload --port 8000
~~~

API docs: http://localhost:8000/docs

### Frontend (Node.js 20+)

~~~powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
~~~

Open http://localhost:3000. Set NEXT_PUBLIC_API_URL in .env.local if the API is hosted elsewhere.

### Tests

~~~powershell
cd backend
pytest -q
~~~

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | Service identity |
| GET | /health | NLP model status |
| POST | /api/v1/analyze | Linguistic analysis |
| POST | /api/v1/documents/extract | Extract text from a supported document |
| POST | /api/v1/study | Generate notes, flashcards, and quiz |

## Development principles

- Light interface only: white and warm-neutral surfaces with lavender, blue, and coral accents.
- Real outputs over placeholder metrics.
- Modular NLP components with testable behaviour.
- Explainable intermediate results for academic demonstration.
- Keep uploaded documents and model artifacts out of Git.
