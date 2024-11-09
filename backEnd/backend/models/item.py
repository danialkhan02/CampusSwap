from pydantic import BaseModel, Field
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

class ProductListQueryParams(BaseModel):
    user_id: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    category: Optional[ItemCategory] = None
    condition: Optional[ItemCondition] = None
    price_min: Optional[float] = Field(default=None, ge=0)
    price_max: Optional[float] = Field(default=None, ge=0)
    sort: Optional[str] = Field(
        default=None,
        pattern='^(price_asc|price_desc|created_at_asc|created_at_desc)$'
    )
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    radius: Optional[float] = Field(default=None, ge=0)

    class Config:
        use_enum_values = True
