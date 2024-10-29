from sqlalchemy import String, Uuid, ForeignKey, Float, Enum, Table, Column, DateTime
from backend.db_models.base import BaseDbModel
from sqlalchemy.sql import func
from sqlalchemy.orm import mapped_column, relationship, Mapped
from backend.enums import ItemCategory
from typing import List

interested_buyers = Table(
    'interested_buyers',
    BaseDbModel.metadata,
    Column('item_id', Uuid, ForeignKey('items.id'), primary_key=True),
    Column('user_id', Uuid, ForeignKey('users.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), default=func.now())
)

class ItemsOrm(BaseDbModel):
    __tablename__ = "items"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String)
    lister_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    images: Mapped[List[str]] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[ItemCategory] = mapped_column(
        Enum(ItemCategory, name="itemcategory", create_type=True, native_enum=True),
        nullable=False,
        server_default=ItemCategory.OTHER.value
    )

    # Relationships
    lister = relationship("UsersOrm", back_populates="items")
    interested_buyers = relationship(
        "UsersOrm",
        secondary=interested_buyers,
        lazy="joined"
    )