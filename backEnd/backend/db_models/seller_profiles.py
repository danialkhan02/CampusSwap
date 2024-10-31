from sqlalchemy import String, Uuid, ForeignKey, Integer, Float
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import DateTime, func

class SellerProfileOrm(BaseDbModel):
    __tablename__ = "seller_profiles"
    
    # Override the table inheritance
    __table_args__ = {'extend_existing': True}
    
    # Define seller_id as the primary key
    seller_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), primary_key=True)
    profile_image_url: Mapped[str] = mapped_column(String, nullable=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Add these columns explicitly since we're not inheriting them
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    deleted_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationship to the user table
    user = relationship("UsersOrm", back_populates="seller_profile")