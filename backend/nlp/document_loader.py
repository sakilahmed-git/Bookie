from __future__ import annotations

from io import BytesIO
from pathlib import Path


def extract_document_text(filename: str, content: bytes) -> str:
    """Extract text from supported document formats without writing uploads to disk."""
    extension = Path(filename).suffix.lower()

    if extension in {".txt", ".md"}:
        try:
            return content.decode("utf-8-sig").strip()
        except UnicodeDecodeError as exc:
            raise ValueError("Text files must use UTF-8 encoding.") from exc

    if extension == ".pdf":
        from pypdf import PdfReader

        try:
            reader = PdfReader(BytesIO(content))
            return "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as exc:
            raise ValueError("The PDF could not be read. It may be encrypted or damaged.") from exc

    if extension == ".docx":
        from docx import Document

        try:
            document = Document(BytesIO(content))
            paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs]
            return "\n".join(paragraph for paragraph in paragraphs if paragraph).strip()
        except Exception as exc:
            raise ValueError("The DOCX file could not be read.") from exc

    raise ValueError("Unsupported format. Upload a .txt, .md, .pdf, or .docx file.")
