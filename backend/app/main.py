from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import chat, health, interview, modes, pdf, settings, speech, tts
from app.core.config import get_settings
from app.core.errors import AppError
from app.services.storage_service import storage_service

app_settings = get_settings()

app = FastAPI(title="Nova AI Voice Assistant API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in [
        app_settings.frontend_origin,
        *app_settings.frontend_origins.split(","),
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=app_settings.frontend_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict:
    return {"status": "ok", "service": "Nova AI Voice Assistant API", "health": "/api/health"}


@app.on_event("startup")
async def startup() -> None:
    storage_service.ensure_storage()


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": {"message": exc.message}})


@app.exception_handler(Exception)
async def unexpected_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": {"message": f"Unexpected error: {exc}"}})


app.include_router(health.router, prefix="/api")
app.include_router(modes.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(speech.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")
app.include_router(interview.router, prefix="/api")

# Backward-compatible route aliases for deployments configured with
# VITE_API_URL=https://backend-domain instead of https://backend-domain/api.
app.include_router(health.router)
app.include_router(modes.router)
app.include_router(settings.router)
app.include_router(chat.router)
app.include_router(tts.router)
app.include_router(speech.router)
app.include_router(pdf.router)
app.include_router(interview.router)
