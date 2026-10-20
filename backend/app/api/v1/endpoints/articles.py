from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.article import ArticleCreate, ArticleResponse
from app.schemas.response import ApiResponse
from app.services.article_service import ArticleService
from app.api.deps import get_current_article_service
from app.core.exceptions import NotFoundException

# Import background tasks from celery_worker
from celery_worker import process_article_task, process_batch_articles_task, write_log_celery

router = APIRouter()


@router.post(
    "",
    response_model=ApiResponse[ArticleResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new article",
    description="Creates a new article with initial status PENDING and empty category/summary fields.",
)
def create_article(
    article_in: ArticleCreate,
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[ArticleResponse]:
    created = service.create(db=db, article_in=article_in)
    return ApiResponse.success(
        message="Article created successfully",
        data=created,
        meta=None,
    )


@router.get(
    "",
    response_model=ApiResponse[List[ArticleResponse]],
    status_code=status.HTTP_200_OK,
    summary="List articles",
    description="Retrieve paginated list of articles with optional filtering by company name and status.",
)
def list_articles(
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    company_name: Optional[str] = Query(None, description="Filter articles by company name (case-insensitive substring)"),
    status: Optional[str] = Query(None, description="Filter articles by status (e.g. PENDING, PROCESSED)"),
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[List[ArticleResponse]]:
    items, meta = service.list_articles(
        db=db,
        page=page,
        page_size=page_size,
        company_name=company_name,
        status=status,
    )
    return ApiResponse.success(
        message="Articles retrieved successfully",
        data=items,
        meta=meta,
    )


@router.get(
    "/{article_id}",
    response_model=ApiResponse[ArticleResponse],
    status_code=status.HTTP_200_OK,
    summary="Get article by ID",
    description="Retrieve a single article by its primary key ID.",
)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[ArticleResponse]:
    article = service.get_by_id(db=db, article_id=article_id)
    if not article:
        raise NotFoundException(message=f"Article with id {article_id} not found")
    return ApiResponse.success(
        message="Article retrieved successfully",
        data=article,
        meta=None,
    )


@router.post(
    "/{article_id}/process",
    response_model=ApiResponse[ArticleResponse],
    status_code=status.HTTP_200_OK,
    summary="Process an article synchronously",
    description="Processes the article immediately to determine its category and generate a summary based on its content.",
)
def process_article_sync(
    article_id: int,
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[ArticleResponse]:
    article = service.get_by_id(db=db, article_id=article_id)
    if not article:
        raise NotFoundException(message=f"Article with id {article_id} not found")

    processed_data = service.article_processing(article)
    updated_article = service.update(
        db=db,
        article_id=article_id,
        update_in={
            "category": processed_data.get("category"),
            "summary": processed_data.get("summary"),
            "status": "PROCESSED",
        },
    )

    return ApiResponse.success(
        message="Article processed successfully (sync)",
        data=updated_article,
        meta=None,
    )


@router.post(
    "/{article_id}/process/celery",
    response_model=ApiResponse[ArticleResponse],
    status_code=status.HTTP_200_OK,
    summary="Process an article asynchronously with Celery",
    description="Queues a background Celery task to classify and summarize the article asynchronously.",
)
def process_article_celery(
    article_id: int,
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[ArticleResponse]:
    article = service.get_by_id(db=db, article_id=article_id)
    if not article:
        raise NotFoundException(message=f"Article with id {article_id} not found")

    # Set status to PROCESSING
    updated_article = service.update(
        db=db,
        article_id=article_id,
        update_in={"status": "PROCESSING"},
    )

    # Queue the Celery background task
    process_article_task.delay(article_id=article_id)

    return ApiResponse.success(
        message="Article processing queued successfully in Celery",
        data=updated_article,
        meta=None,
    )


@router.post(
    "/{article_id}/process/celery/batch",
    response_model=ApiResponse[ArticleResponse],
    status_code=status.HTTP_200_OK,
    summary="Process an article asynchronously with Celery",
    description="Queues a background Celery task to classify and summarize the article asynchronously.",
)
def process_article_celery_batch(
    article_ids: List[int],
    db: Session = Depends(get_db),
    service: ArticleService = Depends(get_current_article_service),
) -> ApiResponse[ArticleResponse]:
    # Set status to PROCESSING for all articles
    for article_id in article_ids:
        article = service.get_by_id(db=db, article_id=article_id)
        if not article:
            raise NotFoundException(message=f"Article with id {article_id} not found")
        service.update(
            db=db,
            article_id=article_id,
            update_in={"status": "PROCESSING"},
        )

    # Queue the Celery background task
    process_batch_articles_task.delay(article_ids=article_ids)

    return ApiResponse.success(
        message="Article processing queued successfully in Celery",
        data=None,
        meta=None,
    )
