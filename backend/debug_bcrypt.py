from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    print(f"Original len: {len(password)}")
    encoded = password.encode('utf-8')
    print(f"Encoded len: {len(encoded)}")
    
    if len(encoded) > 71:
        print("Password too long, hashing with SHA256 first...")
        password = hashlib.sha256(encoded).hexdigest()
        print(f"New password (sha256): {password}")
        print(f"New len: {len(password)}")
    
    return pwd_context.hash(password)

try:
    long_password = "a" * 80
    print(f"Hashing 80-char password...")
    hash = hash_password(long_password)
    print(f"Success! Hash: {hash}")
except Exception as e:
    print(f"Error: {e}")
