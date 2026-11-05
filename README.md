<div align="center">

# bookie<span>.</span>

### Turn information into understanding.

**An NLP-powered learning workspace that transforms your notes and documents into language insights, revision material, and an evidence-grounded AI tutor.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-TBD-lightgrey)](#license)

[Overview](#-the-problem) · [Features](#-what-bookie-does) · [Quick start](#-get-started) · [Architecture](#-how-it-works) · [API](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## ✨ The idea

Learning material is everywhere: lecture notes, PDFs, articles, documentation, and long blocks of text. But turning that information into something understandable and useful takes time.

**Bookie brings that workflow into one place.** Add a piece of source material, inspect its language, discover important terms, create revision activities, and ask questions about what it actually says.

It is designed around one principle:

> **Make learning more active, more explainable, and closer to the source.**

## 🎯 The problem

Students and self-learners often have to jump between separate tools to:

- Read and understand long documents.
- Identify the concepts and terminology that matter.
- Create revision notes and flashcards manually.
- Build practice questions from their own material.
- Ask follow-up questions and check whether an answer is supported by the notes.

Generic AI summaries can also introduce information that was never in the original document. That is a problem when the goal is to study a specific syllabus, lecture, or reference.

### The Bookie approach

Bookie combines traditional NLP, source-based study generation, and optional LLM explanations. The source remains visible, and tutor responses include the passages used to support them.

## 🚀 What Bookie does

<table>
<tr>
<td width="50%" valign="top">

### 🔬 Understand — NLP Laboratory

Inspect the structure of your text:

- Sentence segmentation
- Tokenisation and lemmatisation
- Part-of-speech and fine-grained tags
- Stop-word and punctuation flags
- Named entity recognition
- TF-IDF keyword salience
- Document statistics

</td>
<td width="50%" valign="top">

### 📚 Study — Active Revision

Turn source text into study activities:

- Extractive revision notes
- Concept explorer with source context
- Source-grounded flashcards
- Fill-in-the-blank knowledge checks
- Beginner, intermediate, and advanced quiz sizes
- Browser-local session count and best score

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 💬 Ask — Evidence-grounded Tutor

Ask questions about your loaded material:

- Retrieves relevant source sentences first
- Shows evidence and relevance scores
- Supports three explanation levels
- Supports short follow-up conversation history
- Declines when no relevant evidence is found
- Falls back to retrieved passages if the LLM is unavailable

</td>
<td width="50%" valign="top">

### 📄 Import — Document Ingestion

Bring your own learning material:

- Plain text (`.txt`)
- Markdown (`.md`)
- PDF (`.pdf`)
- Word documents (`.docx`)
- In-memory extraction
- 10 MB upload limit
- Extracted text capped at 50,000 characters

</td>
</tr>
</table>

## 🧠 Why this is different

Bookie is not just a chat box placed beside a document.

1. **Retrieve before explaining.** The tutor searches the uploaded text for relevant passages before asking an LLM to explain them.
2. **Show the evidence.** The interface displays the source sentences used, with relevance scores.
3. **Do not invent an answer when evidence is missing.** If retrieval finds no sufficiently relevant passage, Bookie says so.
4. **Keep a useful offline path.** Without an LLM key, document analysis, study generation, and retrieval-based tutoring still work.
5. **Make the NLP visible.** The project exposes token, sentence, entity, and keyword outputs rather than hiding everything behind one generated response.

### A note on AI accuracy

The current retrieval engine uses **TF-IDF lexical similarity**, not transformer embeddings. A configured LLM receives only the retrieved passages and bounded conversation history, but generated explanations can still be mistaken or incomplete. Always compare an explanation with its displayed source evidence.

Study notes, flashcards, and quiz questions are currently extractive or template-based. They are not independently fact-checked or equivalent to an instructor-written assessment.

## 🖥️ Product experience

The interface follows a light visual system with lavender, blue, and coral accents, rounded workspace panels, and responsive layouts.

The main workflow:

```text
Import a document or paste text
              │
              ▼
       Understand the text
              │
       ┌──────┴──────┐
       ▼             ▼
   Study it       Ask Bookie
       │             │
       ▼             ▼
 Notes, cards     Retrieve evidence
 and quiz             │
                      ▼
               Optional LLM
                explanation
                      │
                      ▼
                Show evidence
```

## 🧰 Technology stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling and UI | Tailwind CSS, Lucide React, Framer Motion |
| Backend API | Python, FastAPI, Pydantic, Uvicorn |
| NLP | spaCy, scikit-learn, TF-IDF |
| Document parsing | pypdf, python-docx |
| Optional AI tutor | OpenAI-compatible Chat Completions API |
| Configuration | python-dotenv |
| Testing | pytest, httpx |

## ⚡ Get started

Run Bookie locally with the frontend and backend in separate terminals.

### Prerequisites

- **Python 3.12** recommended
- **Node.js 20 or later**
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sakilahmed-git/Bookie.git
cd Bookie
```

The development work is currently on the `feat/bookie-foundation` branch. To run that version:

```bash
git checkout feat/bookie-foundation
```

### 2. Set up the backend

**Windows PowerShell**

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

If PowerShell blocks virtual-environment activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Start the API from the `backend` directory:

```bash
python -m uvicorn main:app --reload --port 8000
```

The API is now available at:

- App root: http://localhost:8000
- Interactive API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

> **spaCy model:** Installing `en_core_web_sm` enables the trained POS-tagging and named-entity pipelines. If it is not installed, Bookie falls back to a blank English pipeline; tokenisation and sentence segmentation remain available, but trained POS and NER results will not.

### 3. Set up the frontend

Open a **second terminal** from the repository root:

```bash
cd frontend
npm install
```

Create the local environment file.

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**

```bash
cp .env.example .env.local
```

The default frontend configuration is:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start Next.js:

```bash
npm run dev
```

Open **http://localhost:3000**.

### 4. Optional: enable AI tutor explanations

Bookie works without an LLM API key. Without one, Ask Bookie uses local TF-IDF retrieval and returns the matching source passages.

To enable generated explanations:

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your provider's API key to `BOOKIE_LLM_API_KEY`.
3. Set the model and base URL if your provider requires different values.
4. Restart the backend.

Example configuration:

```env
BOOKIE_LLM_PROVIDER=openai-compatible
BOOKIE_LLM_API_KEY=your_server_side_api_key
BOOKIE_LLM_MODEL=gpt-4o-mini
BOOKIE_LLM_BASE_URL=https://api.openai.com/v1
BOOKIE_LLM_TIMEOUT=25
```

**Security:** Keep this key in `backend/.env` only. Never put it in `frontend/.env.local`, a `NEXT_PUBLIC_*` variable, source code, screenshots, or a committed file. The `.env` files are excluded from Git; commit only the placeholder `.env.example`.

The tutor uses an OpenAI-compatible `/chat/completions` endpoint. For a different provider, use its compatible base URL, model name, and key.

## 🧪 Run tests and checks

### Backend tests

From the `backend` directory, with the virtual environment activated:

```bash
pytest -q
```

### Frontend TypeScript check

From the `frontend` directory:

```bash
npm run lint
```

### Production build

```bash
npm run build
```

## 🔌 API reference

The backend exposes the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Service identity |
| `GET` | `/health` | NLP and tutor configuration status |
| `POST` | `/api/v1/analyze` | Analyse text |
| `POST` | `/api/v1/documents/extract` | Extract text from an uploaded file |
| `POST` | `/api/v1/study` | Generate a study pack |
| `POST` | `/api/v1/tutor` | Ask a source-grounded tutor question |

### Analyse text

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Natural language processing helps computers analyse and understand human language. Tokenisation divides text into smaller units."}'
```

### Generate a study pack

```bash
curl -X POST http://localhost:8000/api/v1/study \
  -H "Content-Type: application/json" \
  -d '{"text":"Natural language processing helps computers analyse and understand human language. Tokenisation divides text into smaller units.","difficulty":"beginner"}'
```

### Ask the tutor

```bash
curl -X POST http://localhost:8000/api/v1/tutor \
  -H "Content-Type: application/json" \
  -d '{"text":"Photosynthesis converts light energy into chemical energy. Chlorophyll absorbs sunlight in plant leaves.","question":"What does chlorophyll do?","level":"beginner","history":[]}'
```

### Upload a document

```bash
curl -X POST http://localhost:8000/api/v1/documents/extract \
  -F "file=@./my-notes.pdf"
```

All JSON text endpoints require at least 20 characters of source text. The tutor question must contain at least 4 characters. The API schema and interactive request examples are available at http://localhost:8000/docs.

## 🗂️ Project structure

```text
Bookie/
├── backend/
│   ├── nlp/
│   │   ├── document_loader.py   # TXT, MD, PDF, DOCX extraction
│   │   ├── engine.py             # spaCy analysis and TF-IDF keywords
│   │   ├── study.py              # Notes, concepts, flashcards, quiz
│   │   └── tutor.py              # Evidence retrieval and optional LLM
│   ├── tests/                    # Backend tests
│   ├── .env.example              # Safe configuration template
│   ├── main.py                   # FastAPI routes
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Main workspace
│   │   └── StudyWorkspace.tsx    # Study and tutor experience
│   ├── public/
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🔐 Data handling and current limits

- Document uploads are read and parsed in memory; the document extraction route does not save uploaded files to disk.
- The backend accepts uploads up to 10 MB and truncates extracted text to 50,000 characters.
- Scanned or image-only PDFs are not OCR-processed.
- The study session count and best score are stored in the browser's local storage.
- The optional LLM receives retrieved source passages and up to eight recent chat turns. Do not send confidential or sensitive material to an external model unless you have approval to do so.
- The current CORS configuration allows the local frontend at `http://localhost:3000`; update it deliberately when deploying elsewhere.
- The project is an educational MVP, not a substitute for expert review, formal assessment, or verified academic references.

## 🧭 Roadmap

The following are future directions, not claims about features already shipped:

- [ ] Semantic retrieval with transformer embeddings
- [ ] Better source-grounded question generation and distractors
- [ ] OCR for scanned documents
- [ ] More interactive learning challenges
- [ ] Topic and concept relationship exploration
- [ ] Content transformation and export workflows
- [ ] Deployment configuration and automated CI checks

## 🤝 Contributing

Contributions and practical feedback are welcome.

1. Fork the repository.
2. Create a focused feature branch.
3. Keep NLP outputs explainable and source-grounded.
4. Add or update tests for behaviour changes.
5. Open a pull request describing the change and how it was checked.

## 🎓 Project context

Built as **P26 — Automated Content Transformation Platform** for **CSE472: Natural Language Processing**.

## 📄 License

No license has been added yet. Until a license is included in the repository, assume that standard copyright applies and reuse is not automatically permitted.

---

<div align="center">

**bookie. — Understand it. Transform it. Master it.**

Made to make learning material more useful, one source at a time.

</div>
