from sqlalchemy import String, Uuid, ForeignKey
from backend.db_models.base import BaseDbModel
from sqlalchemy.orm import mapped_column, relationship, Mapped

class ItemImagesOrm(BaseDbModel):
    __tablename__ = "item_images"
    
    item_id: Mapped[Uuid] = mapped_column(Uuid, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    image_data: Mapped[str] = mapped_column(String, nullable=False)  # Store the image string here
    
    # Relationship
    item = relationship("ItemsOrm", back_populates="item_images")