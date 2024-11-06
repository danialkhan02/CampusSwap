from sqlalchemy import String, Uuid, ForeignKey, Float, Enum, Table, Column, DateTime, ARRAY
from backend.db_models.base import BaseDbModel
from backend.db_models.item_images import ItemImagesOrm
from sqlalchemy.sql import func
from sqlalchemy.orm import mapped_column, relationship, Mapped
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from typing import List

interested_buyers = Table(
    'interested_buyers',
    BaseDbModel.metadata,
    Column('item_id', Uuid, ForeignKey('items.id'), primary_key=True),
    Column('user_id', Uuid, ForeignKey('users.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), default=func.now()),
    Column('deleted_at', DateTime(timezone=True), nullable=True)
)

class ItemsOrm(BaseDbModel):
    __tablename__ = "items"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String)
    lister_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[ItemCategory] = mapped_column(
        Enum(ItemCategory, name="itemcategory", create_type=True, native_enum=True),
        nullable=False,
        server_default=ItemCategory.OTHER.value
    )
    status: Mapped[ItemStatus] = mapped_column(
        Enum(ItemStatus, name="itemstatus", create_type=True, native_enum=True),
        nullable=False,
        server_default=ItemStatus.STATUS_NEW.value
    )
    condition: Mapped[ItemCondition] = mapped_column(
        Enum(ItemCondition, name="itemcondition", create_type=True, native_enum=True),
        nullable=False,
        server_default=ItemCondition.CONDITION_NEW.value
    )

    # Relationships
    lister = relationship("UsersOrm", back_populates="items")
    interested_buyers = relationship(
        "UsersOrm",
        secondary=interested_buyers,
        lazy="joined"
    )

    # One-to-Many Relationship
    item_images: Mapped[List["ItemImagesOrm"]] = relationship(
        "ItemImagesOrm", 
        back_populates="item", 
        cascade="all, delete-orphan",
        lazy="select"
    )

    # One-to-One Relationship
    embeddings: Mapped["ProductEmbeddingsOrm"] = relationship(
        "ProductEmbeddingsOrm",
        back_populates="product",
        lazy="select"
    )

class ProductEmbeddingsOrm(BaseDbModel):
    __tablename__ = "product_embeddings"

    id: Mapped[Uuid] = mapped_column(Uuid, primary_key=True)
    product_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("items.id"))
    name_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))
    category_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))
    address_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))
    price_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))
    description_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))
    condition_embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))

    # FKs
    product: Mapped["ItemsOrm"] = relationship(back_populates="embeddings")