# bookie.

**Understand it. Transform it. Master it.**

Bookie is an NLP-powered content transformation platform for turning dense text and documents into clear explanations, study materials, interactive knowledge checks, and reusable content.

> Course project: **CSE472 — Natural Language Processing**  
> Project title: **P26 — Automated Content Transformation Platform**

## Product direction

Bookie is designed around what a person wants to do with information:

- **Understand** — simplify difficult passages and surface key ideas.
- **Study** — turn source material into notes, flashcards, and quizzes.
- **Play** — practise knowledge through short challenges.
- **Explore** — discover entities, topics, and relationships.
- **Create** — repurpose source material into useful content.

The platform is NLP-first: preprocessing, linguistic analysis, feature extraction, semantic analysis, transformation, and evaluation are explicit parts of the system—not hidden behind a generic chat interface.

## Repository structure

```text
bookie/
├── backend/
│   ├── nlp/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   └── package.json
└── docs/
```

## Getting started

### Backend (Python 3.12 recommended)

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn main:app --reload --port 8000
```

API documentation: http://localhost:8000/docs

### Frontend (Node.js 20+)

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Set `NEXT_PUBLIC_API_URL` in `.env.local` if the backend is not running at http://localhost:8000.

## Initial NLP capabilities

The first analysis endpoint provides:

- sentence segmentation and tokenisation
- lemmas, POS tags, fine-grained tags, and stop-word flags
- named entity recognition
- sentence-level TF-IDF keyword extraction
- document statistics and model availability information

TF-IDF is calculated across the input's sentences. For a single-sentence input, term scores are not meaningfully discriminative; the API reports this limitation.

## Development principles

- Light interface only: white and warm-neutral surfaces with lavender, blue, and coral accents.
- Real outputs over placeholder metrics.
- Modular NLP components with testable behaviour.
- Explainable intermediate results for academic demonstration.
- Model downloads are kept out of the source repository.

## Academic note

Pretrained spaCy pipelines are used for linguistic annotation and entity recognition. The project also exposes the processing results so that NLP concepts can be inspected and evaluated. Additional transformations and evaluation metrics will be introduced incrementally.
