from sqlalchemy import String, Uuid, ForeignKey, Integer, Float
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped

class SellerProfileOrm(BaseDbModel):
    __tablename__ = "seller_profiles"
    
    seller_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), primary_key=True)
    seller_name: Mapped[str] = mapped_column(String, nullable=False)
    profile_image_url: Mapped[str] = mapped_column(String, nullable=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationship to the user table
    user = relationship("UsersOrm", back_populates="seller_profile")