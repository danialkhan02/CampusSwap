from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional, List
from backend.enums import ItemCategory
from backend.models.user import User

class Location(BaseModel):
    latitude: float
    longitude: float
    address: str

class ItemImage(BaseModel):
    image_data: bytes
    content_type: str
    display_order: int = 0

class Item(BaseModel):
    name: str
    title: str
    description: Optional[str] = None
    images: List[ItemImage] = []
    lister_id: uuid_pkg.UUID
    price: float
    location: Optional[Location] = None
    category: ItemCategory = ItemCategory.OTHER

class ItemInDB(Item):
    id: uuid_pkg.UUID
    seller: User
    interested_buyers: List[User] = []