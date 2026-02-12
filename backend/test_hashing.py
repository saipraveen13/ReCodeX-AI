from passlib.context import CryptContext

# Test pbkdf2_sha256 scheme
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def test_hashing():
    print("Testing password hashing with pbkdf2_sha256...")
    
    # Test normal password
    password = "testpassword123"
    print(f"Hashing normal password (len={len(password)})...")
    try:
        hash1 = pwd_context.hash(password)
        print(f"Success! Hash: {hash1[:20]}...")
        
        # Verify
        if pwd_context.verify(password, hash1):
            print("Verification successful!")
        else:
            print("Verification FAILED!")
            
    except Exception as e:
        print(f"Error hashing normal password: {e}")

    # Test long password
    long_password = "a" * 100
    print(f"\nHashing long password (len={len(long_password)})...")
    try:
        hash2 = pwd_context.hash(long_password)
        print(f"Success! Hash: {hash2[:20]}...")
        
        # Verify
        if pwd_context.verify(long_password, hash2):
            print("Verification successful!")
        else:
            print("Verification FAILED!")
            
    except Exception as e:
        print(f"Error hashing long password: {e}")

if __name__ == "__main__":
    test_hashing()
