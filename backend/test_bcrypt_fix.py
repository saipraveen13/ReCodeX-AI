from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt (handles long passwords)"""
    # BCrypt has a 72 byte limit. If password is longer, hash it first.
    if len(password.encode('utf-8')) > 71:
        print("Password too long, hashing with SHA256 first...")
        password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    return pwd_context.hash(password)

try:
    password = "testpassword123"
    print(f"Hashing '{password}' (len={len(password)})...")
    hash = hash_password(password)
    print(f"Success! Hash: {hash}")
    
    long_password = "a" * 80
    print(f"Hashing 80-char password (len={len(long_password)})...")
    hash = hash_password(long_password)
    print(f"Success! Hash: {hash}")
except Exception as e:
    print(f"Error: {e}")
