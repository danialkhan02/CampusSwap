from sqlalchemy import String, Uuid, ForeignKey, Integer, Float
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import DateTime, func
from backend.db_models.base import BaseDbModel

class SellerProfileOrm(BaseDbModel):
    __tablename__ = "seller_profiles"
    
    # Primary key
    seller_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), primary_key=True)
    
    # Profile fields
    profile_image_url: Mapped[str] = mapped_column(String, nullable=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Timestamp fields
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        default=func.now(),
    )
    deleted_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), default=None, nullable=True
    )

    # Use string reference to avoid circular import
    user = relationship("UsersOrm", back_populates="seller_profile", lazy="select")

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}