from sqlalchemy import (
    Column, Integer, String, Text,
    DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)

    platform = Column(String(50), nullable=False)
    external_id = Column(String(255), nullable=False)

    title = Column(Text, nullable=False)
    channel_name = Column(String(255))
    description = Column(Text)

    video_url = Column(Text)
    thumbnail_url = Column(Text)

    published_at = Column(DateTime(timezone=True))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    snapshots = relationship(
        "MetricSnapshot",
        back_populates="content"
    )

    __table_args__ = (
        UniqueConstraint(
            "platform",
            "external_id",
            name="unique_platform_content"
        ),
    )


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    content_id = Column(
        Integer,
        ForeignKey("content_items.id"),
        nullable=False
    )

    views = Column(Integer, nullable=True)
    likes = Column(Integer, nullable=True)
    comments = Column(Integer, nullable=True)

    collected_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    content = relationship(
        "ContentItem",
        back_populates="snapshots"
    )