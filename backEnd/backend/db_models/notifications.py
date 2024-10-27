from sqlalchemy import String, Uuid, ForeignKey, Boolean, DateTime
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import func

class NotificationsOrm(BaseDbModel):
    __tablename__ = "notifications"
    
    user_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    notif_type: Mapped[str] = mapped_column(String, nullable=False)
    notif_string: Mapped[str] = mapped_column(String, nullable=False)
    delete_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationship to the user table
    user = relationship("UsersOrm", back_populates="notifications")