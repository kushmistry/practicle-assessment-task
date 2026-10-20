from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleUpdate
from app.repositories.base import BaseRepository


class ArticleRepository(BaseRepository[Article]):
    def __init__(self):
        super().__init__(Article)

    def create_article(self, db: Session, *, article_in: ArticleCreate) -> Article:
        # Phase 1 requirement: Category and summary must remain NULL upon creation.
        # Default status is 'PENDING'.
        db_article = Article(
            company_name=article_in.company_name,
            title=article_in.title,
            url=str(article_in.url),
            content=article_in.content,
            status="PENDING",
            category=None,
            summary=None,
        )
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        return db_article

    def get_paginated(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        company_name: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Article], int]:
        query = db.query(self.model)

        if company_name:
            query = query.filter(self.model.company_name.ilike(f"%{company_name}%"))

        if status:
            query = query.filter(func.lower(self.model.status) == status.strip().lower())

        total = query.count()
        articles = (
            query.order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return articles, total

    def update_article(
        self, db: Session, *, db_article: Article, update_in: ArticleUpdate
    ) -> Article:
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_article, field, value)
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        return db_article


article_repository = ArticleRepository()

