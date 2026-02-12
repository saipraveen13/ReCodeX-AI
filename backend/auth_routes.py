"""
Authentication routes: register, login, get current user
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from database import get_database
from user_models import UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdate
from auth import hash_password, verify_password, create_access_token, get_current_user_email

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user
    
    - Creates new user account
    - Hashes password with bcrypt
    - Returns JWT token
    """
    db = get_database()
    users_collection = db.users
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "password_hash": password_hash,
        "name": user_data.name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user
    result = await users_collection.insert_one(user_doc)
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.email})
    
    # Return token and user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login user
    
    - Verifies email and password
    - Returns JWT token
    """
    db = get_database()
    users_collection = db.users
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["email"]})
    
    # Return token and user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            email=user["email"],
            name=user["name"],
            created_at=user.get("created_at")
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(email: str = Depends(get_current_user_email)):
    """
    Get current user information
    
    Requires valid JWT token in Authorization header
    """
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        email=user["email"],
        name=user["name"],
        created_at=user.get("created_at")
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    email: str = Depends(get_current_user_email)
):
    """
    Update user profile (name)
    """
    db = get_database()
    users_collection = db.users
    
    # Update user name
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"name": update_data.name, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get updated user
    user = await users_collection.find_one({"email": email})
    
    return UserResponse(
        email=user["email"],
        name=user["name"],
        created_at=user.get("created_at")
    )


@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_account(email: str = Depends(get_current_user_email)):
    """
    Delete user account and all associated history
    """
    db = get_database()
    users_collection = db.users
    history_collection = db.history
    
    # 1. Delete user history
    await history_collection.delete_many({"user_email": email})
    
    # 2. Delete user account
    result = await users_collection.delete_one({"email": email})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "success": True,
        "message": "User account and history deleted successfully"
    }

