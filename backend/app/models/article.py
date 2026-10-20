from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), index=True, nullable=False)
    title = Column(String(512), nullable=False)
    url = Column(String(2048), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING", index=True, nullable=False)
    category = Column(String(100), nullable=True, default=None)
    summary = Column(Text, nullable=True, default=None)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

