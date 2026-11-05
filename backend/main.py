from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nlp.engine import BookieNLPEngine

engine = BookieNLPEngine()

app = FastAPI(
    title="Bookie NLP API",
    description="Language analysis services for the Bookie content transformation platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50_000)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Bookie",
        "message": "Understand it. Transform it. Master it.",
        "status": "running",
    }


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "healthy", "nlp": engine.status}


@app.post("/api/v1/analyze")
def analyze_text(request: AnalyzeRequest) -> dict[str, object]:
    try:
        return engine.analyze(request.text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Text analysis failed. Check the backend logs for details.",
        ) from exc
