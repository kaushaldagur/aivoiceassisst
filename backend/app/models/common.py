from pydantic import BaseModel


class ApiMessage(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    message: str
