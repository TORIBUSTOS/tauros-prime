from sqlalchemy import Column, Integer, String, Float, Date, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.core.config import get_settings

settings = get_settings()
Base = declarative_base()

class Movimiento(Base):
    __tablename__ = "movimientos"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    descripcion = Column(String(500), nullable=False)
    monto = Column(Float, nullable=False)
    categoria = Column(String(100), nullable=False, index=True)
    subcategoria = Column(String(100), nullable=True)
    tipo = Column(String(50), nullable=False, index=True, default="egreso") # ingreso | egreso
    confianza = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ImportBatch(Base):
    __tablename__ = "import_batches"
    id = Column(Integer, primary_key=True, index=True)
    nombre_archivo = Column(String(255), nullable=False)
    cantidad_movimientos = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class CascadaRule(Base):
    __tablename__ = "cascada_rules"
    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(100), nullable=False, index=True)
    subcategoria = Column(String(100), nullable=True)
    patron = Column(String(255), nullable=False, unique=True, index=True)
    peso = Column(Float, default=0.50)
    veces_usada = Column(Integer, default=1)
    activo = Column(Integer, default=1)

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
