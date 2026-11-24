
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContentRecord(BaseModel):
    platform: str
    video_id: str
    title: str
    channel_name: str
    description: Optional[str] = None

    published_at: Optional[datetime] = None
    video_url: str
    thumbnail_url: Optional[str] = None

    views: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None

    category: Optional[str] = None
