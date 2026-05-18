from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.core.config import get_settings
from src.models.base import Base

settings = get_settings()

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

class Insight(Base):
    __tablename__ = "insights"
    id = Column(Integer, primary_key=True, index=True)
    periodo = Column(String(7), nullable=False, index=True) # YYYY-MM
    tipo = Column(String(50), nullable=False) # patron | outlier | hormiga | salud
    concepto = Column(String(255), nullable=False)
    valor = Column(Float, nullable=True)
    contexto = Column(String(500), nullable=True)
    score_importancia = Column(Float, default=0.0)
    recomendacion = Column(String(500), nullable=True)
    data_json = Column(String, nullable=True) # JSON stored as string for simplicity in SQLite if needed
    created_at = Column(DateTime, default=datetime.utcnow)

class InsightCandidate(Base):
    __tablename__ = "insight_candidates"
    id = Column(Integer, primary_key=True, index=True)
    candidate_uid = Column(String(64), nullable=False, unique=True, index=True)
    tipo = Column(String(50), nullable=False, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    severidad = Column(String(20), nullable=False, index=True)
    periodo_analizado = Column(String(7), nullable=False, index=True)
    regla_disparadora = Column(String(120), nullable=False, index=True)
    datos_utilizados = Column(Text, nullable=False)
    explicacion = Column(Text, nullable=False)
    accion_sugerida = Column(Text, nullable=False)
    estado_revision = Column(String(30), nullable=False, default="pending", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PatronRecurrente(Base):
    __tablename__ = "patrones_recurrentes"
    id = Column(Integer, primary_key=True, index=True)
    concepto = Column(String(255), nullable=False, unique=True)
    frecuencia = Column(String(50), nullable=False) # mensual | quincenal | semanal
    monto_promedio = Column(Float, nullable=False)
    dia_mes = Column(Integer, nullable=True) # Día del mes sugerido
    ultimo_movimiento = Column(Date, nullable=True)
    proxima_estimada = Column(Date, nullable=True)
    confianza = Column(Float, default=0.0)
    activo = Column(Integer, default=1)
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

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True) # movimiento, regla
    entity_id = Column(Integer, nullable=False)
    action = Column(String(50), nullable=False) # recategorizacion, creacion_regla, borrado
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    details = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ManualObligation(Base):
    __tablename__ = "manual_obligations"
    id = Column(Integer, primary_key=True, index=True)
    concepto = Column(String(255), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_limite = Column(Date, nullable=False)
    prioridad = Column(Integer, default=1) # 1: baja, 2: media, 3: alta
    pagado = Column(Integer, default=0) # 0: no, 1: si
    created_at = Column(DateTime, default=datetime.utcnow)

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
