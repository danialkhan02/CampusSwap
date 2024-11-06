from sqlalchemy import String, Uuid, ForeignKey, Integer, Float
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import DateTime, func
from backend.db_models.base import BaseDbModel

class SellerProfileOrm(BaseDbModel):
    __tablename__ = "seller_profiles"
    
    # Primary key
    seller_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), primary_key=True)
    
    # Profile fields
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)

    # Number of listings
    num_listings: Mapped[int] = mapped_column(Integer, default=0)

    # Use string reference to avoid circular import
    user = relationship("UsersOrm", back_populates="seller_profile", lazy="select")

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}