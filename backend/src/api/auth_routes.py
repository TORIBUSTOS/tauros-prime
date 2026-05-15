from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.models.movement import get_db
from src.models.auth import User
from src.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from src.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": user.username
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_db)): # Temporalmente sin seguridad para testing o ajustando
    # Esto se ajustará para usar get_current_user una vez probado
    pass
