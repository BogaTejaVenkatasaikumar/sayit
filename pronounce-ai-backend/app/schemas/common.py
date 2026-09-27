from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Error code identifier")
    message: str = Field(..., description="Human readable error message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Success status flag")
    error: ErrorDetail


class StandardResponse(BaseModel, Generic[T]):
    success: bool = Field(True, description="Success status flag")
    data: Optional[T] = None
