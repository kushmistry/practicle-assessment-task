from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

DataType = TypeVar("DataType")


class PaginationMeta(BaseModel):
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")


class ApiResponse(BaseModel, Generic[DataType]):
    status: str = Field(..., description="Response status: 'success' or 'error'")
    message: str = Field(..., description="Human-readable response message")
    data: Optional[DataType] = Field(default=None, description="Response payload data")
    meta: Optional[PaginationMeta] = Field(default=None, description="Metadata such as pagination")

    @classmethod
    def success(
        cls,
        message: str = "Success",
        data: Optional[DataType] = None,
        meta: Optional[PaginationMeta] = None,
    ) -> "ApiResponse[DataType]":
        return cls(status="success", message=message, data=data, meta=meta)

    @classmethod
    def error(
        cls,
        message: str = "Error",
        data: Optional[Any] = None,
        meta: Optional[PaginationMeta] = None,
    ) -> "ApiResponse[Any]":
        return cls(status="error", message=message, data=data, meta=meta)

