from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class ArticleBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255, description="Name of the company")
    title: str = Field(..., min_length=1, max_length=512, description="Article headline")
    url: str = Field(..., min_length=1, max_length=2048, description="URL of the news source")
    content: str = Field(..., min_length=1, description="Article body content")

    @field_validator("company_name", "title", "content", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty or blank")
        return v


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None


class ArticleResponse(ArticleBase):
    id: int
    status: str
    category: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedArticlesResponse(BaseModel):
    items: List[ArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

