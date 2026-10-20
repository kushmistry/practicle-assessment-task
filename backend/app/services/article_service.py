import math
from typing import Any, Dict, List, Optional, Tuple, Union
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

    def update(self, db: Session, article_id: int, update_in: Union[dict, Any]) -> Optional[ArticleResponse]:
        db_article = self.repo.get(db=db, id=article_id)
        if not db_article:
            return None
        updated_article = self.repo.update_article(db=db, db_article=db_article, update_in=update_in)
        return ArticleResponse.model_validate(updated_article)

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

    def article_processing(self, article: Union[dict, ArticleResponse]) -> dict:
        """
        Classifies article into a category and produces a concise summary based on content.
        """
        if hasattr(article, "model_dump"):
            data = article.model_dump()
        elif isinstance(article, dict):
            data = article
        else:
            data = dict(article)

        content = data.get("content", "")
        title = data.get("title", "")
        combined_text = f"{title} {content}".lower()

        tech_keywords = ["software", "ai", "llm", "ml", "c++", "coding", "python", "cloud", "api", "data"]
        matched_keywords = [kw for kw in tech_keywords if kw in combined_text]

        if matched_keywords:
            category = "Technology"
            key_topics = ", ".join(k.upper() if len(k) <= 3 else k.capitalize() for k in matched_keywords)
            summary = (
                f"This article discusses technology innovations and development. "
                f"Identified core topics: {key_topics}."
            )
        else:
            category = "General"
            summary = "This article covers general corporate announcements, news, or press releases."

        return {
            "category": category,
            "summary": summary,
        }


article_service = ArticleService()
