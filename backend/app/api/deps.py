from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.article_service import ArticleService, article_service


def get_current_article_service() -> ArticleService:
    return article_service

