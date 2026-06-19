import fitz
from fastapi import UploadFile

from app.core.errors import AppError
from app.services.gemini_service import gemini_service
from app.services.prompt_service import pdf_prompt
from app.services.storage_service import storage_service


class PdfService:
    async def upload(self, file: UploadFile) -> dict:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise AppError("Please upload a valid PDF file.")
        data = await file.read()
        try:
            document = fitz.open(stream=data, filetype="pdf")
            text = "\n".join(page.get_text("text") for page in document)
        except Exception as exc:
            raise AppError("The PDF could not be read. It may be invalid or corrupted.") from exc
        if not text.strip():
            raise AppError("No readable text was found in this PDF.")
        storage_service.save_pdf_text(file.filename, text)
        return storage_service.get_pdf_info()

    async def ask(self, question: str, language: str) -> str:
        text = storage_service.get_pdf_text()
        if not text.strip():
            raise AppError("Upload a PDF before asking document questions.")
        return await gemini_service.generate(pdf_prompt(question, language, text))


pdf_service = PdfService()
