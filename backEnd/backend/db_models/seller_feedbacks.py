from sqlalchemy import String, Uuid, ForeignKey, Integer, Boolean, DateTime
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import func

class SellerFeedbackOrm(BaseDbModel):
    __tablename__ = "seller_feedback"
    
    seller_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    buyer_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback_message: Mapped[str] = mapped_column(String, nullable=False)
    verified_purchase: Mapped[bool] = mapped_column(Boolean, default=False)
    seller_response: Mapped[str] = mapped_column(String, nullable=True)
    timestamp: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())

    # Relationships
    seller = relationship("UsersOrm", foreign_keys=[seller_id], back_populates="seller_feedbacks")
    buyer = relationship("UsersOrm", foreign_keys=[buyer_id], back_populates="buyer_feedbacks")