from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional

# this user is primarily for adding/post calls from fe
class Item(BaseModel):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    lister_id: uuid_pkg.UUID
    price: float
    location: Optional[str] = None

class ItemInDB(Item):
    id: uuid_pkg.UUID
