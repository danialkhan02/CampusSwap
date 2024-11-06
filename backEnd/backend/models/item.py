from pydantic import BaseModel
from backend.base_api_model import BaseApiModel
import uuid as uuid_pkg
from typing import Optional, List
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.models.user import UserSummary, User

class Location(BaseModel):
    latitude: float
    longitude: float
    address: str

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    images: List[str] = []
    lister_id: uuid_pkg.UUID
    price: float
    location: Optional[Location] = None
    category: ItemCategory = ItemCategory.OTHER
    status: ItemStatus = ItemStatus.STATUS_NEW
    condition: ItemCondition = ItemCondition.CONDITION_NEW

class ItemSummary(BaseApiModel):
    name: str
    price: float
    lister_information: UserSummary
    image: str

class ItemInDB(Item):
    id: uuid_pkg.UUID
    seller: User
    interested_buyers: List[User] = []

class GenerateDescriptionRequest(BaseModel):
    name: str
    images: List[str]
    category: ItemCategory
    condition: ItemCondition