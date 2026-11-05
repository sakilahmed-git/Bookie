import os
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nlp.document_loader import extract_document_text
from nlp.engine import BookieNLPEngine
from nlp.study import build_study_pack
from nlp.tutor import SourceTutor

engine = BookieNLPEngine()
tutor = SourceTutor()
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

app = FastAPI(
    title="Bookie API",
    description="Source understanding, study-material, and grounded tutoring services for Bookie.",
    version="0.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("BOOKIE_CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class TextRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50_000)


class StudyRequest(TextRequest):
    difficulty: str = Field(default="intermediate", pattern="^(beginner|intermediate|advanced)$")


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)


class TutorRequest(TextRequest):
    question: str = Field(min_length=4, max_length=1_000)
    level: str = Field(default="intermediate", pattern="^(beginner|intermediate|advanced)$")
    history: list[ChatTurn] = Field(default_factory=list, max_length=8)


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Bookie", "message": "Make knowledge useful.", "status": "running"}


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "healthy", "nlp": engine.status, "tutor": tutor.status}


@app.post("/api/v1/analyze")
def analyze_text(request: TextRequest) -> dict[str, object]:
    try:
        return engine.analyze(request.text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Text analysis failed.") from exc


@app.post("/api/v1/documents/extract")
async def extract_document(file: UploadFile = File(...)) -> dict[str, object]:
    filename = file.filename or "document"
    try:
        content = await file.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds the 10 MB upload limit.")
        extracted = extract_document_text(filename, content)
        if len(extracted) > 50_000:
            extracted = extracted[:50_000]
            truncated = True
        else:
            truncated = False
        if len(extracted.strip()) < 20:
            raise HTTPException(status_code=422, detail="The document contains too little extractable text.")
        return {"filename": filename, "text": extracted, "characters": len(extracted), "truncated": truncated}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    finally:
        await file.close()


@app.post("/api/v1/study")
def create_study_pack(request: StudyRequest) -> dict[str, object]:
    try:
        return build_study_pack(request.text, engine.analyze(request.text), request.difficulty)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Study pack generation failed.") from exc


@app.post("/api/v1/tutor")
def ask_source_tutor(request: TutorRequest) -> dict[str, object]:
    try:
        history = [turn.model_dump() for turn in request.history]
        return tutor.answer(request.question, request.text, request.level, history)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Tutor request failed.") from exc
