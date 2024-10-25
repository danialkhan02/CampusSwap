from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional

class SellerProfile(BaseModel):
    seller_name: str
    profile_image_url: Optional[str] = None
    phone_number: Optional[str] = None
    total_transactions: int = 0
    average_rating: float = 0.0

class SellerProfileInDB(SellerProfile):
    seller_id: uuid_pkg.UUID