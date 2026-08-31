# ==================================================
# RESOLVEAI JWT AUTHENTICATION
# ==================================================

from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Depends,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from pydantic import BaseModel, EmailStr

from jose import JWTError, jwt

from pwdlib import PasswordHash

from Backend.database import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    revoke_token,
    is_token_revoked,
)


# ==================================================
# CONFIGURATION
# ==================================================

SECRET_KEY = "resolveai-development-secret-key-change-this"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 480


# ==================================================
# PASSWORD HASHING
# ==================================================

password_hash = PasswordHash.recommended()


# ==================================================
# HTTP BEARER SECURITY
# ==================================================

security = HTTPBearer()


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==================================================
# REQUEST MODELS
# ==================================================

class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# ==================================================
# CREATE JWT TOKEN
# ==================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {

        "sub": str(user_id),

        "email": email,

        "role": role,

        "exp": expire,

    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==================================================
# GET CURRENT USER
# ==================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    # ==================================================
    # GET JWT TOKEN
    # ==================================================

    token = credentials.credentials


    # ==================================================
    # CHECK REVOKED TOKEN
    # ==================================================

    if is_token_revoked(token):

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Token has been revoked."

        )


    # ==================================================
    # DECODE JWT
    # ==================================================

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]

        )

        user_id = payload.get(
            "sub"
        )


        if user_id is None:

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Invalid authentication token."

            )


    except JWTError:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired authentication token."

        )


    # ==================================================
    # GET USER FROM DATABASE
    # ==================================================

    user = get_user_by_id(
        int(user_id)
    )


    if user is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="User account not found."

        )


    # ==================================================
    # RETURN USER
    # ==================================================

    return user


# ==================================================
# REQUIRE ADMIN
# ==================================================

def require_admin(
    current_user: dict = Depends(
        get_current_user
    )
):

    role = current_user.get(
        "role",
        "USER"
    ).upper()


    if role != "ADMIN":

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Administrator permission required."

        )


    return current_user


# ==================================================
# REQUIRE USER OR ADMIN
# ==================================================

def require_authenticated_user(
    current_user: dict = Depends(
        get_current_user
    )
):

    return current_user


# ==================================================
# REGISTER
# ==================================================

@router.post("/register")
def register(
    request: RegisterRequest
):

    # ==================================================
    # NORMALIZE INPUT
    # ==================================================

    name = request.name.strip()

    email = request.email.lower().strip()


    # ==================================================
    # VALIDATE NAME
    # ==================================================

    if not name:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Name is required."

        )


    # ==================================================
    # CHECK EXISTING USER
    # ==================================================

    existing_user = get_user_by_email(
        email
    )


    if existing_user:

        raise HTTPException(

            status_code=status.HTTP_409_CONFLICT,

            detail="An account with this email already exists."

        )


    # ==================================================
    # VALIDATE PASSWORD
    # ==================================================

    if len(request.password) < 6:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Password must contain at least 6 characters."

        )


    # ==================================================
    # HASH PASSWORD
    # ==================================================

    hashed_password = password_hash.hash(
        request.password
    )


    # ==================================================
    # CREATE USER
    # ==================================================

    try:

        user = create_user(

            username=name,

            email=email,

            password_hash=hashed_password,

            role="USER"

        )

    except Exception as e:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail=f"Unable to create account: {str(e)}"

        )


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "success": True,

        "message": "Registration successful.",

        "user": {

            "id": user["id"],

            "username": user["username"],

            "email": user["email"],

            "role": user["role"]

        }

    }


# ==================================================
# LOGIN
# ==================================================

@router.post("/login")
def login(
    request: LoginRequest
):

    # ==================================================
    # NORMALIZE EMAIL
    # ==================================================

    email = request.email.lower().strip()


    # ==================================================
    # FIND USER
    # ==================================================

    user = get_user_by_email(
        email
    )


    if not user:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password."

        )


    # ==================================================
    # VERIFY PASSWORD
    # ==================================================

    try:

        password_valid = password_hash.verify(

            request.password,

            user["password_hash"]

        )

    except Exception:

        password_valid = False


    if not password_valid:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password."

        )


    # ==================================================
    # CREATE JWT
    # ==================================================

    access_token = create_access_token(

        user_id=user["id"],

        email=user["email"],

        role=user["role"]

    )


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "success": True,

        "message": "Login successful.",

        "access_token": access_token,

        "token_type": "bearer",

        "user": {

            "id": user["id"],

            "username": user["username"],

            "email": user["email"],

            "role": user["role"]

        }

    }


# ==================================================
# CURRENT USER
# ==================================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(
        get_current_user
    )
):

    return {

        "success": True,

        "user": {

            "id": current_user["id"],

            "username": current_user["username"],

            "email": current_user["email"],

            "role": current_user["role"],

            "created_at": current_user["created_at"]

        }

    }


# ==================================================
# LOGOUT
# ==================================================

@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    # ==================================================
    # GET TOKEN
    # ==================================================

    token = credentials.credentials


    # ==================================================
    # REVOKE TOKEN
    # ==================================================

    revoke_token(
        token
    )


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "success": True,

        "message": "Logout successful."

    }