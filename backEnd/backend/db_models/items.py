from sqlalchemy import String, Uuid, ForeignKey, Float, Enum
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from backend.enums import ItemCategory


class ItemsOrm(BaseDbModel):
    __tablename__ = "items"
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String)
    image: Mapped[str] = mapped_column(String)
    lister_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[str] = mapped_column(String)
    category: Mapped[ItemCategory] = mapped_column(
        Enum(ItemCategory, name="itemcategory", create_type=True, native_enum=True),
        nullable=False,
        server_default=ItemCategory.OTHER.value
    )

    # Relationship to the user table
    lister = relationship("UsersOrm", back_populates="items")