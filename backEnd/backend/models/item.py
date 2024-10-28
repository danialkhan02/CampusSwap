from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional
from backend.enums import ItemCategory

# this user is primarily for adding/post calls from fe
class Item(BaseModel):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    lister_id: uuid_pkg.UUID
    price: float
    location: Optional[str] = None
    category: ItemCategory = ItemCategory.OTHER

class ItemInDB(Item):
    id: uuid_pkg.UUID
