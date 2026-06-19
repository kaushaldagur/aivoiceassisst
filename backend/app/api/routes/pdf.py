from fastapi import APIRouter, File, UploadFile

from app.models.pdf import PdfQuestionRequest
from app.services.pdf_service import pdf_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> dict:
    return {"pdf": await pdf_service.upload(file)}


@router.get("/current")
async def current_pdf() -> dict:
    return {"pdf": storage_service.get_pdf_info()}


@router.delete("/current")
async def clear_pdf() -> dict:
    storage_service.clear_pdf()
    return {"message": "PDF removed.", "pdf": storage_service.get_pdf_info()}


@router.post("/ask")
async def ask_pdf(request: PdfQuestionRequest) -> dict:
    answer = await pdf_service.ask(request.question, request.language)
    return {"answer": answer, "sourceReference": "Current uploaded PDF"}
