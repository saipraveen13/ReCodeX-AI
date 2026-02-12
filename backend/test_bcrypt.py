from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    password = "testpassword123"
    print(f"Hashing '{password}' (len={len(password)})...")
    hash = pwd_context.hash(password)
    print(f"Success! Hash: {hash}")
    
    long_password = "a" * 80
    print(f"Hashing 80-char password (len={len(long_password)})...")
    hash = pwd_context.hash(long_password)
    print(f"Success! Hash: {hash}")
except Exception as e:
    print(f"Error: {e}")
