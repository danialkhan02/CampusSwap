from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional

class SellerFeedback(BaseModel):
    seller_id: uuid_pkg.UUID
    buyer_id: uuid_pkg.UUID
    rating: int
    feedback_message: str
    verified_purchase: bool
    seller_response: Optional[str] = None

class SellerFeedbackInDB(SellerFeedback):
    id: uuid_pkg.UUID