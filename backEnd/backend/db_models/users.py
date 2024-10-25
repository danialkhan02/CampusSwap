from sqlalchemy import String, Uuid, ForeignKey
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from typing import List

from backend.db_models.categories import CategoriesOrm
from backend.db_models.notifications import NotificationsOrm
from backend.db_models.seller_feedbacks import SellerFeedbackOrm

class UsersOrm(BaseDbModel):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    stytch_id: Mapped[str] = mapped_column(String)

    # One-to-Many Relationship
    categories: Mapped[List["CategoriesOrm"]] = relationship(
        "CategoriesOrm", back_populates="lister", lazy="select"
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

    seller_profile = relationship("SellerProfileOrm", back_populates="user", uselist=False)