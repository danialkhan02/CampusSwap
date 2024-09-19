import os
import uuid as uuid_pkg
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.dialects import postgresql as psql
from sqlalchemy import DateTime, Uuid, func
from sqlalchemy.orm import mapped_column, Mapped


class BaseDbModel(DeclarativeBase):
    __abstract__ = True
    id: Mapped[Uuid] = mapped_column(
        psql.UUID(as_uuid=True), default=uuid_pkg.uuid4, primary_key=True, index=True
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        default=func.now(),
    )
    deleted_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), default=None, nullable=True
    )

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
