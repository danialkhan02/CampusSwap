from sqlalchemy import LargeBinary, String, Uuid, ForeignKey, Integer
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped

class ItemImagesOrm(BaseDbModel):
    __tablename__ = "item_images"
    
    item_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    image_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    content_type: Mapped[str] = mapped_column(String, nullable=False)  # e.g., 'image/jpeg', 'image/png'
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationship
    item = relationship("ItemsOrm", back_populates="item_images") 