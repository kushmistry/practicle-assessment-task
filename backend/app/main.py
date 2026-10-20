from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.handlers import register_exception_handlers
from app.api.v1.router import api_router
from app.schemas.response import ApiResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Register uniform exception handlers
register_exception_handlers(app)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", response_model=ApiResponse[dict], tags=["health"])
def health_check():
    return ApiResponse.success(
        message="Service is healthy",
        data={"project": settings.PROJECT_NAME, "status": "UP"},
    )


@app.get("/", response_model=ApiResponse[dict], tags=["root"])
def root():
    return ApiResponse.success(
        message=f"Welcome to {settings.PROJECT_NAME}",
        data={
            "docs": "/docs",
            "health": "/health",
            "api_version": "v1",
        },
    )
