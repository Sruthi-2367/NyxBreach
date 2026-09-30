from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from security import SECRET_KEY, ALGORITHM

def get_current_user(authorization: str = Header(...)):
    try:
        # Expecting header format: "Bearer <token>"
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user