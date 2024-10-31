from sqlalchemy import String, Uuid, ForeignKey
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from typing import List

from backend.db_models.items import ItemsOrm
from backend.db_models.notifications import NotificationsOrm
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_models.seller_profiles import SellerProfileOrm

class UsersOrm(BaseDbModel):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    stytch_id: Mapped[str] = mapped_column(String)

    profile_image_url: Mapped[str] = mapped_column(String, nullable=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)

    # One-to-Many Relationships
    items: Mapped[List["ItemsOrm"]] = relationship(
        "ItemsOrm", back_populates="lister", lazy="select"
    )
    
    notifications: Mapped[List["NotificationsOrm"]] = relationship(
        "NotificationsOrm", back_populates="user", lazy="select"
    )

    seller_feedbacks: Mapped[List["SellerFeedbackOrm"]] = relationship(
        "SellerFeedbackOrm", 
        back_populates="seller", 
        foreign_keys="SellerFeedbackOrm.seller_id",
        lazy="select"
    )
    
    buyer_feedbacks: Mapped[List["SellerFeedbackOrm"]] = relationship(
        "SellerFeedbackOrm", 
        back_populates="buyer", 
        foreign_keys="SellerFeedbackOrm.buyer_id",
        lazy="select"
    )

    # One-to-One Relationship by setting uselist to False
    # This means that each user can have only one seller profile
    seller_profile: Mapped["SellerProfileOrm"] = relationship(
        "SellerProfileOrm", 
        back_populates="user", 
        uselist=False
    )
