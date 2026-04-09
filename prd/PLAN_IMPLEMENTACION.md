# TORO_Prime Implementation Plan

> **Para agentes ejecutores:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans para ejecutar este plan task-by-task. Pasos usan checkbox (`- [ ]`) para tracking.

**Objetivo:** Construir TORO_Prime: plataforma de análisis financiero con motor de insights inteligente que habilite decisiones estratégicas (costos, forecasting, disponibilidad de fondos).

**Arquitectura:** API-First Modular con FastAPI (Backend Track A) + Next.js (Frontend Track B) en paralelo. 8 Bloques Negros secuenciados: Backend primero (parseo → insights → forecasting → API), luego Frontend (dashboard → reportes → analytics → integración).

**Tech Stack:** Python 3.12 + FastAPI + SQLAlchemy + SQLite (Backend) | Node.js + Next.js + React + CSS Vanilla (Frontend) | Pytest >85% + Vitest >70% (Testing)

---

## Etapa 0: Setup Inicial (Antes de código)

### Task 0.1: Crear estructura base de carpetas

**Archivos:**
- Crear: `toro-prime/backend/src/__init__.py`
- Crear: `toro-prime/backend/src/main.py`
- Crear: `toro-prime/backend/src/api/__init__.py`
- Crear: `toro-prime/backend/src/services/__init__.py`
- Crear: `toro-prime/backend/src/models/__init__.py`
- Crear: `toro-prime/backend/src/schemas/__init__.py`
- Crear: `toro-prime/backend/src/core/__init__.py`
- Crear: `toro-prime/backend/src/database/__init__.py`
- Crear: `toro-prime/backend/tests/__init__.py`
- Crear: `toro-prime/backend/tests/conftest.py`
- Crear: `toro-prime/backend/requirements.txt`
- Crear: `toro-prime/backend/.env.example`
- Crear: `toro-prime/frontend/app/layout.tsx`
- Crear: `toro-prime/frontend/app/page.tsx`
- Crear: `toro-prime/frontend/components/__init__.ts`
- Crear: `toro-prime/frontend/hooks/__init__.ts`
- Crear: `toro-prime/frontend/services/__init__.ts`
- Crear: `toro-prime/frontend/package.json`
- Crear: `toro-prime/.gitignore`

- [ ] **Step 1: Crear carpetas backend**

```bash
mkdir -p toro-prime/backend/src/{api,services,models,schemas,core,database}
mkdir -p toro-prime/backend/tests
```

- [ ] **Step 2: Crear carpetas frontend**

```bash
mkdir -p toro-prime/frontend/app
mkdir -p toro-prime/frontend/{components,hooks,services,styles,lib,tests,public}
```

- [ ] **Step 3: Crear archivos __init__.py (backend)**

Backend: crea archivos vacíos `__init__.py` en todas las carpetas mencionadas arriba.

```bash
touch toro-prime/backend/src/__init__.py
touch toro-prime/backend/src/api/__init__.py
# ... y así para todas las carpetas
```

- [ ] **Step 4: Crear .gitignore raíz**

```
toro-prime/.gitignore
```

Contenido:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# Node
node_modules/
.next/
out/
*.tsbuildinfo
.turbo/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# Database
*.db
toro_prime.db

# Tests
.pytest_cache/
.coverage
htmlcov/

# Build
dist/
build/
*.egg-info/

# OS
.DS_Store
Thumbs.db

# Claude Code
.claude/
```

- [ ] **Step 5: Commit estructura inicial**

```bash
git add toro-prime/
git commit -m "feat: initial project structure for TORO_Prime

- Create backend directories (api, services, models, schemas, core, database)
- Create frontend directories (app, components, hooks, services, styles)
- Add .gitignore"
```

---

## TRACK A: Backend (Claude) — Bloques Negros 001-004

### BN-001: Parser + Categorización Cascada

#### Task 1.1: Configurar FastAPI + SQLAlchemy base

**Archivos:**
- Crear: `backend/src/core/config.py`
- Crear: `backend/src/database/session.py`
- Crear: `backend/src/database/base.py`
- Crear: `backend/src/main.py`
- Crear: `backend/requirements.txt`

- [ ] **Step 1: Crear config.py**

```python
# backend/src/core/config.py
import os
from pathlib import Path

class Settings:
    """Configuración de la aplicación."""
    
    PROJECT_NAME = "TORO_Prime"
    DEBUG = os.getenv("DEBUG", "True") == "True"
    
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{Path(__file__).parent.parent.parent}/toro_prime.db"
    )
    
    # API
    API_PREFIX = "/api"
    
    # Categories (hardcoded, podrían ser en DB later)
    CATEGORIES = {
        "Ingresos": {"color": "#10b981"},
        "Egresos": {"color": "#ef4444"},
        "Otros": {"color": "#f59e0b"},
    }
    
    CONFIDENCE_THRESHOLD = 70  # % mínimo para aplicar regla

settings = Settings()
```

- [ ] **Step 2: Crear session.py (SQLAlchemy)**

```python
# backend/src/database/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency para inyectar DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 3: Crear base.py (ORM base)**

```python
# backend/src/database/base.py
from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

- [ ] **Step 4: Crear main.py (FastAPI app)**

```python
# backend/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

- [ ] **Step 5: Crear requirements.txt**

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pandas==2.0.3
openpyxl==3.10.0
pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1
httpx==0.25.1
python-multipart==0.0.6
```

- [ ] **Step 6: Crear .env.example**

```
# backend/.env.example
DEBUG=True
DATABASE_URL=sqlite:///toro_prime.db
```

- [ ] **Step 7: Commit**

```bash
cd backend
git add src/core/config.py src/database/session.py src/database/base.py
git add src/main.py requirements.txt .env.example
git commit -m "feat(BN-001): setup FastAPI + SQLAlchemy base

- Add Settings configuration (database, api prefix, categories)
- Setup SQLAlchemy engine and SessionLocal
- Create FastAPI app with CORS middleware
- Add requirements.txt with all dependencies"
```

---

#### Task 1.2: Crear modelo Movimiento (ORM)

**Archivos:**
- Crear: `backend/src/models/movimiento.py`

- [ ] **Step 1: Definir modelo Movimiento**

```python
# backend/src/models/movimiento.py
from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4
from sqlalchemy import Column, String, Date, Numeric, ForeignKey, JSON, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from database.base import Base

class Movimiento(Base):
    """Transacción bancaria individual."""
    
    __tablename__ = "movimientos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    fecha = Column(Date, nullable=False, index=True)
    descripcion_original = Column(String, nullable=False)
    monto = Column(Numeric(15, 2), nullable=False)
    tipo = Column(String(20), nullable=False)  # Ingreso, Egreso
    categoria = Column(String(100))
    subcategoria = Column(String(100))
    periodo = Column(String(7), nullable=False, index=True)  # YYYY-MM
    metadata_extraida = Column(JSON, nullable=True)
    confianza_porcentaje = Column(Float, default=0.0)
    clasificacion_locked = Column(Boolean, default=False)
    batch_id = Column(String(36), ForeignKey("import_batches.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    batch = relationship("ImportBatch", back_populates="movimientos")
```

- [ ] **Step 2: Crear modelo ImportBatch**

```python
# backend/src/models/movimiento.py (agregar a archivo existente)

class ImportBatch(Base):
    """Control de trazabilidad de importaciones."""
    
    __tablename__ = "import_batches"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    fecha_importacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    total_movimientos = Column(int, default=0)
    usuario_id = Column(String(100), nullable=True)
    estado = Column(String(20), default="Success")  # Success, Failed, Partial
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    movimientos = relationship("Movimiento", back_populates="batch", cascade="all, delete-orphan")
```

- [ ] **Step 3: Crear modelo CascadaRule**

```python
# backend/src/models/movimiento.py (agregar a archivo existente)

class CascadaRule(Base):
    """Reglas de categorización."""
    
    __tablename__ = "cascada_rules"
    
    id = Column(int, primary_key=True, autoincrement=True)
    patron = Column(String(255), nullable=False)  # regex o keyword
    categoria = Column(String(100), nullable=False)
    subcategoria = Column(String(100), nullable=True)
    prioridad = Column(int, default=100)  # 1 = highest
    source = Column(String(20), default="Sistema")  # Sistema, Usuario, AI-Derived
    confidence_hint = Column(Float, default=0.8)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 4: Actualizar database/base.py para importar modelos**

```python
# backend/src/database/base.py
from sqlalchemy.orm import declarative_base
from models.movimiento import Movimiento, ImportBatch, CascadaRule

Base = declarative_base()

__all__ = ["Base", "Movimiento", "ImportBatch", "CascadaRule"]
```

- [ ] **Step 5: Commit**

```bash
git add src/models/movimiento.py src/database/base.py
git commit -m "feat(BN-001): create ORM models for movements and batches

- Define Movimiento model (transactions with categorization, metadata)
- Define ImportBatch model (import audit trail)
- Define CascadaRule model (categorization rules)
- Setup relationships and indices"
```

---

#### Task 1.3: Crear Pydantic schemas (validación)

**Archivos:**
- Crear: `backend/src/schemas/movimiento.py`

- [ ] **Step 1: Definir schemas**

```python
# backend/src/schemas/movimiento.py
from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

class MovimientoBase(BaseModel):
    """Base para movimiento."""
    fecha: date
    descripcion_original: str
    monto: Decimal
    tipo: str  # Ingreso, Egreso
    periodo: str  # YYYY-MM

class MovimientoCreate(MovimientoBase):
    """Input para crear movimiento."""
    pass

class MovimientoResponse(MovimientoBase):
    """Output de movimiento."""
    id: str
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    confianza_porcentaje: float
    clasificacion_locked: bool
    metadata_extraida: Optional[dict] = None
    
    class Config:
        from_attributes = True

class ImportResponse(BaseModel):
    """Response de importación."""
    batch_id: str
    total_movimientos: int
    procesados: int
    fallidos: int
    errores: list[dict] = []
```

- [ ] **Step 2: Commit**

```bash
git add src/schemas/movimiento.py
git commit -m "feat(BN-001): add Pydantic schemas for validation

- Create MovimientoBase, MovimientoCreate, MovimientoResponse
- Add ImportResponse schema
- Enable input/output validation with Pydantic"
```

---

#### Task 1.4: Crear servicio de Parser (ingesta)

**Archivos:**
- Crear: `backend/src/services/import_service.py`
- Crear: `backend/src/services/__init__.py`

- [ ] **Step 1: Crear import_service.py**

```python
# backend/src/services/import_service.py
import pandas as pd
from io import BytesIO
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from models.movimiento import Movimiento, ImportBatch

class ImportService:
    """Servicio de importación de extractos bancarios."""
    
    @staticmethod
    def parse_excel(file_bytes: bytes) -> pd.DataFrame:
        """Parsear archivo Excel a DataFrame."""
        df = pd.read_excel(BytesIO(file_bytes))
        return df
    
    @staticmethod
    def validate_structure(df: pd.DataFrame) -> bool:
        """Validar que el DataFrame tenga columnas requeridas."""
        required_cols = {"fecha", "descripcion", "monto"}
        # Case-insensitive check
        df_cols_lower = {col.lower() for col in df.columns}
        return required_cols.issubset(df_cols_lower)
    
    @staticmethod
    def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """Normalizar formato de datos."""
        # Renombrar columnas (case-insensitive)
        col_mapping = {col: col.lower() for col in df.columns}
        df = df.rename(columns=col_mapping)
        
        # Convertir tipos
        df["fecha"] = pd.to_datetime(df["fecha"]).dt.date
        df["monto"] = pd.to_numeric(df["monto"])
        df["descripcion"] = df["descripcion"].str.strip().str.upper()
        
        # Agregar período (YYYY-MM)
        df["periodo"] = df["fecha"].apply(lambda x: x.strftime("%Y-%m"))
        
        # Agregar tipo (heurística simple: si monto negativo = Egreso)
        df["tipo"] = df["monto"].apply(lambda x: "Egreso" if x < 0 else "Ingreso")
        df["monto"] = df["monto"].abs()  # Guardar valores positivos
        
        return df
    
    @staticmethod
    def create_batch(db: Session, filename: str, total: int) -> ImportBatch:
        """Crear registro de batch."""
        batch = ImportBatch(
            id=str(uuid4()),
            fecha_importacion=datetime.utcnow(),
            nombre_archivo=filename,
            total_movimientos=total,
            estado="Processing"
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)
        return batch
    
    @staticmethod
    def detect_duplicates(db: Session, df: pd.DataFrame, batch_id: str) -> list:
        """Detectar duplicados en BD."""
        duplicates = []
        for idx, row in df.iterrows():
            # Hash de (fecha, descripcion, monto)
            existing = db.query(Movimiento).filter(
                Movimiento.fecha == row["fecha"],
                Movimiento.descripcion_original == row["descripcion"],
                Movimiento.monto == row["monto"],
                Movimiento.batch_id != batch_id
            ).first()
            if existing:
                duplicates.append(idx)
        return duplicates
    
    @staticmethod
    def import_movements(db: Session, batch: ImportBatch, df: pd.DataFrame):
        """Importar movimientos a BD."""
        for idx, row in df.iterrows():
            mov = Movimiento(
                id=str(uuid4()),
                fecha=row["fecha"],
                descripcion_original=row["descripcion"],
                monto=float(row["monto"]),
                tipo=row["tipo"],
                periodo=row["periodo"],
                batch_id=batch.id,
                categoria="Otros",  # Se categoriza en BN-002
                subcategoria=None,
                confianza_porcentaje=0.0,
                clasificacion_locked=False,
                metadata_extraida={}
            )
            db.add(mov)
        db.commit()
```

- [ ] **Step 2: Crear tests para import_service**

```python
# backend/tests/test_import_service.py
import pytest
import pandas as pd
from io import BytesIO
from services.import_service import ImportService

def test_parse_excel():
    """Test parsing Excel básico."""
    # Crear DataFrame simple
    df = pd.DataFrame({
        "fecha": ["2024-01-15"],
        "descripcion": ["Test"],
        "monto": [100.0]
    })
    
    # Guardar a Excel bytes
    buffer = BytesIO()
    df.to_excel(buffer, index=False)
    excel_bytes = buffer.getvalue()
    
    # Parsear
    result = ImportService.parse_excel(excel_bytes)
    assert len(result) == 1
    assert "fecha" in result.columns

def test_validate_structure():
    """Test validación de estructura."""
    df_valid = pd.DataFrame({
        "fecha": ["2024-01-15"],
        "descripcion": ["Test"],
        "monto": [100.0]
    })
    assert ImportService.validate_structure(df_valid) == True
    
    df_invalid = pd.DataFrame({
        "campo1": [1],
        "campo2": [2]
    })
    assert ImportService.validate_structure(df_invalid) == False

def test_normalize_dataframe():
    """Test normalización."""
    df = pd.DataFrame({
        "Fecha": ["2024-01-15"],
        "Descripcion": ["  TEST TRANSFER  "],
        "Monto": ["-100.50"]
    })
    
    result = ImportService.normalize_dataframe(df)
    
    assert result["descripcion"].iloc[0] == "TEST TRANSFER"
    assert result["tipo"].iloc[0] == "Egreso"
    assert result["monto"].iloc[0] == 100.50
    assert result["periodo"].iloc[0] == "2024-01"
```

- [ ] **Step 3: Ejecutar tests**

```bash
cd backend
pytest tests/test_import_service.py -v
```

Esperado: ✅ 3 passed

- [ ] **Step 4: Commit**

```bash
git add src/services/import_service.py tests/test_import_service.py
git commit -m "feat(BN-001): add import service with parsing and normalization

- Parse Excel/CSV to DataFrame
- Validate structure (required columns)
- Normalize data (types, casing, formatting)
- Create import batch records
- Detect duplicates
- Import movements to database
- Add comprehensive tests (3 test cases)"
```

---

#### Task 1.5: Crear API endpoint /api/import

**Archivos:**
- Crear: `backend/src/api/routes.py`

- [ ] **Step 1: Crear routes.py**

```python
# backend/src/api/routes.py
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.movimiento import ImportResponse
from services.import_service import ImportService
from database.session import get_db
from core.config import settings

router = APIRouter(prefix=settings.API_PREFIX, tags=["import"])

@router.post("/import", response_model=ImportResponse)
async def import_extract(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importar extracto bancario."""
    
    try:
        # Leer archivo
        file_bytes = await file.read()
        
        # Parse
        df = ImportService.parse_excel(file_bytes)
        
        # Validar
        if not ImportService.validate_structure(df):
            raise HTTPException(
                status_code=400,
                detail="Archivo debe tener columnas: fecha, descripcion, monto"
            )
        
        # Normalizar
        df = ImportService.normalize_dataframe(df)
        
        # Detectar duplicados
        duplicates = ImportService.detect_duplicates(db, df, "")
        
        # Crear batch
        batch = ImportService.create_batch(db, file.filename, len(df))
        
        # Importar
        ImportService.import_movements(db, batch, df)
        
        return ImportResponse(
            batch_id=batch.id,
            total_movimientos=len(df),
            procesados=len(df) - len(duplicates),
            fallidos=len(duplicates),
            errores=[
                {"fila": i+2, "razon": "Duplicado detectado"}
                for i in duplicates
            ]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 2: Agregar router a main.py**

```python
# backend/src/main.py (modificar)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router as import_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(import_router)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

- [ ] **Step 3: Test endpoint**

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

En otra terminal:
```bash
# Crear test file
python -c "
import pandas as pd
df = pd.DataFrame({
    'fecha': ['2024-01-15', '2024-01-16'],
    'descripcion': ['TEST 1', 'TEST 2'],
    'monto': [100, 200]
})
df.to_excel('test_extract.xlsx', index=False)
"

# Subir
curl -X POST "http://localhost:8000/api/import" -F "file=@test_extract.xlsx"
```

Esperado:
```json
{
  "batch_id": "...",
  "total_movimientos": 2,
  "procesados": 2,
  "fallidos": 0,
  "errores": []
}
```

- [ ] **Step 4: Commit**

```bash
git add src/api/routes.py src/main.py
git commit -m "feat(BN-001): add POST /api/import endpoint

- Accept Excel/CSV file upload
- Validate and normalize data
- Detect duplicates
- Create import batch
- Return import response with stats"
```

---

**[Continuación de tareas...]**

Debido a la extensión, continuaré con tareas resumidas. El patrón es:

**BN-002** (Insights Engine): Task 2.1-2.3 (models, service tests, API endpoints)
**BN-003** (Forecasting): Task 3.1-3.3 (models, service tests, API endpoints)
**BN-004** (API Complete): Task 4.1-4.3 (remaining endpoints, documentation, integration tests)

**TRACK B** (Frontend): Tareas 5-8 paralelas a Backend

---

## Ejecución

Este plan está dividido en **8 Bloques Negros × 3-4 tareas cada uno = ~32 tareas**.

**Tiempo estimado**: 
- Backend (BN-001 a 004): 40-50 horas (pasos pequeños, tests exhaustivos)
- Frontend (BN-005 a 008): 35-45 horas (pasos pequeños, integración gradual)
- **Total v1**: 75-95 horas de desarrollo agentic

---

## Próximos Pasos

**Plan guardado en**: `prd/PLAN_IMPLEMENTACION.md`

### Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)**
- Lanzo un subagente fresco por tarea
- Review entre tareas
- Iteración rápida
- **REQUIRED SUB-SKILL**: `superpowers:subagent-driven-development`

**2. Inline Execution**
- Ejecuto tareas en esta sesión
- Ejecución en batch con checkpoints
- Menos overhead
- **REQUIRED SUB-SKILL**: `superpowers:executing-plans`

**¿Cuál prefieres?** 🚀
