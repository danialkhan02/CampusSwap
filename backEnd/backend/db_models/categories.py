from sqlalchemy import String, Uuid, ForeignKey, Float
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped


class CategoriesOrm(BaseDbModel):
    __tablename__ = "categories"
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String)
    image: Mapped[str] = mapped_column(String)
    lister_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[str] = mapped_column(String)

    # Relationship to the user table
    lister = relationship("UsersOrm", back_populates="categories")