"""
User models and schemas for authentication
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Request Models
class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


# Response Models
class UserResponse(BaseModel):
    """User response (without password)"""
    email: str
    name: str
    created_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    """User profile update request"""
    name: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Database Model
class UserInDB(BaseModel):
    """User model in database"""
    email: str
    password_hash: str
    name: str
    created_at: datetime
    updated_at: datetime
