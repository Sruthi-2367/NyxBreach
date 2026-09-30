from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# This sets up bcrypt as our password hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key used to sign our login tokens - keep this private in real deployment
SECRET_KEY = "nyxbreach-dev-secret-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)