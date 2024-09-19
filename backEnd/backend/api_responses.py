from backend.base_api_model import BaseApiModel
from typing import Optional


class ErrMessage(BaseApiModel):
    message: str
    details: Optional[list | str] = None


class ApiResponse(BaseApiModel):
    data: Optional[list | dict] = None
    error: Optional[ErrMessage] = None
