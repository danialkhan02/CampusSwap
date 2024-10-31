from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional

class SellerProfile(BaseModel):
    num_listings: int = 0
    total_transactions: int = 0
    average_rating: float = 0.0

class SellerProfileInDB(SellerProfile):
    seller_id: uuid_pkg.UUID