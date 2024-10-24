from sqlalchemy import String, Uuid, ForeignKey
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped


class UsersOrm(BaseDbModel):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    stytch_id: Mapped[str] = mapped_column(String)

    categories = relationship("CategoriesOrm", back_populates="lister")