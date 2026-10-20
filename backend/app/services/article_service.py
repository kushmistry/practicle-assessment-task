import math
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleResponse
from app.schemas.response import PaginationMeta
from app.repositories.article_repository import ArticleRepository, article_repository


class ArticleService:
    def __init__(self, repo: ArticleRepository = article_repository):
        self.repo = repo

    def create(self, db: Session, article_in: ArticleCreate) -> ArticleResponse:
        created = self.repo.create_article(db=db, article_in=article_in)
        return ArticleResponse.model_validate(created)

    def get_by_id(self, db: Session, article_id: int) -> Optional[ArticleResponse]:
        article = self.repo.get(db=db, id=article_id)
        if not article:
            return None
        return ArticleResponse.model_validate(article)

    def list_articles(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 10,
        company_name: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[ArticleResponse], PaginationMeta]:
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        skip = (page - 1) * page_size

        articles, total = self.repo.get_paginated(
            db=db,
            skip=skip,
            limit=page_size,
            company_name=company_name,
            status=status,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 0
        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

        items = [ArticleResponse.model_validate(art) for art in articles]
        return items, meta


article_service = ArticleService()
