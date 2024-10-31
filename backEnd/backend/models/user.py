from backend.base_api_model import BaseApiModel
from backend.models.provider import Provider
from pydantic import UUID4, EmailStr
from typing import Optional


# this user is primarily for adding/post calls from fe
class User(BaseApiModel):
    first_name: str
    last_name: str
    email: EmailStr
    provider: Provider
    id: Optional[UUID4] = None
    stytch_id: str
    oauth_id: Optional[str] = None
    profile_image_url: Optional[str] = None
    phone_number: Optional[str] = None
    description: Optional[str] = None
