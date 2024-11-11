from backend.base_api_model import BaseApiModel
import uuid as uuid_pkg
from typing import Optional
from backend.models.user import UserSummary

class SellerFeedback(BaseApiModel):
    seller: UserSummary
    buyer: UserSummary
    rating: int
    feedback_message: str
    verified_purchase: bool
    seller_response: Optional[str] = None

class SellerFeedbackInDB(SellerFeedback):
    id: uuid_pkg.UUID