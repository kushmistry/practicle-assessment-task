import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery import Celery
from app.db.session import SessionLocal
from app.services.article_service import article_service

# Configure Celery with Redis broker and result backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery(
    "company_news_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)
celery_app = celery  # Alias for standard Celery conventions

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)


@celery.task(name="process_article_task")
def process_article_task(article_id: int):
    """
    Background Celery task that processes an article:
    1. Fetches article from database
    2. Determines category and generates summary
    3. Updates status to PROCESSED and persists results
    """
    db = SessionLocal()
    try:
        article = article_service.get_by_id(db=db, article_id=article_id)
        if not article:
            print(f"[Celery] Article #{article_id} not found in database.")
            return {"status": "error", "message": f"Article #{article_id} not found"}

        # Perform classification & summarization
        processed_data = article_service.article_processing(article)

        # Update article record in database
        updated_article = article_service.update(
            db=db,
            article_id=article_id,
            update_in={
                "category": processed_data.get("category"),
                "summary": processed_data.get("summary"),
                "status": "PROCESSED",
            },
        )

        print(f"[Celery] Successfully processed Article #{article_id}: Category='{updated_article.category}'")
        return {
            "status": "success",
            "article_id": article_id,
            "category": updated_article.category,
            "summary": updated_article.summary,
        }
    except Exception as exc:
        print(f"[Celery] Error processing Article #{article_id}: {exc}")
        try:
            article_service.update(db=db, article_id=article_id, update_in={"status": "FAILED"})
        except Exception:
            pass
        raise exc
    finally:
        db.close()


@celery.task(name="process_batch_articles_task")
def process_batch_articles_task(article_ids: list):
    for article_id in article_ids:
        process_article_task.delay(article_id)


@celery.task(name="write_log_celery")
def write_log_celery(message: str):
    """Simple test task that logs a message."""
    print(f"[Celery Task Log]: {message}")
    return {"message": message}
