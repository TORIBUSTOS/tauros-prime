# TECNOLOGIAS.md — Stack Técnico de TORO_Prime

> Documento definitorio del stack. FIJO hasta nueva ADR.  
> Este es el contrato de tecnología entre visión y ejecución.

---

## Stack Summary

| Capa | Tecnología | Versión | Justificación |
|:---|:---|:---|:---|
| **Backend** | FastAPI | ^0.104 | Async, OpenAPI nativo, desarrollo rápido |
| **Runtime Backend** | Python | 3.12+ | Data science ready, ORM maduro |
| **DB** | SQLite | v3 | Local, simple, suficiente para single-user |
| **ORM** | SQLAlchemy | ^2.0 | Type-safe, migraciones, relaciones |
| **Frontend** | Next.js | 14+ | App Router, SSR/CSR flexible, modern DX |
| **Runtime Frontend** | Node.js | 18+ | Ecosystem maduro |
| **Styling** | CSS Vanilla + Variables | - | Control total, performance, no dependencias |
| **UI Components** | shadcn/ui o custom | - | A definir con kit de marca TORO |
| **Visualización** | Recharts o Chart.js | - | A definir según preferencias |
| **HTTP Client** | Fetch API / Axios | - | A definir (probablemente Axios) |
| **Testing Backend** | Pytest | ^7.0 | Gold standard en Python |
| **Testing Frontend** | Vitest + RTL | ^1.0 | Fast, ESM, React Testing Library |
| **Version Control** | Git | - | Github (si aplica) |

---

## Backend — FastAPI + Python

### 1. FastAPI

**Versión**: ^0.104.0  
**¿Por qué?**
- Async nativo (rendimiento)
- OpenAPI/Swagger documentation automática (`/docs`)
- Validación de entrada con Pydantic (menos bugs)
- Comunidad activa, documentación excelente
- Perfect para APIs REST

**Características clave**:
- Decoradores `@app.get()`, `@app.post()` (simple)
- Middleware support
- Dependency injection built-in
- CORS, authentication hooks

**Dependencias FastAPI**:
```
fastapi==0.104.1
uvicorn==0.24.0  # ASGI server
python-multipart==0.0.6  # Form parsing
```

---

### 2. SQLAlchemy ORM

**Versión**: ^2.0  
**¿Por qué?**
- Type-safe con Pydantic integration
- Relaciones automáticas
- Lazy loading, eager loading control
- Query builder elegante
- SQLite + Postgres compatibility

**Patrones**:
```python
# Models (models/movimento.py)
class Movimento(Base):
    __tablename__ = "movimientos"
    id: Mapped[UUID] = mapped_column(primary_key=True)
    fecha: Mapped[date]
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"))
    
    categoria: Mapped["Categoria"] = relationship(back_populates="movimientos")

# Query
session.query(Movimento).filter(Movimento.periodo == "2024-03").all()
```

**Dependencias**:
```
sqlalchemy==2.0.23
```

---

### 3. Pydantic v2

**Versión**: ^2.0  
**¿Por qué?**
- Validación de entrada/salida automática
- Type hints = documentación
- Errores claros
- JSON schema automático

**Uso**:
```python
# Schemas (schemas/movimento.py)
class MovimientoCreate(BaseModel):
    fecha: date
    descripcion: str
    monto: Decimal
    tipo: Literal["Ingreso", "Egreso"]
    
    @field_validator("monto")
    def monto_positive(cls, v):
        if v == 0:
            raise ValueError("Monto debe ser != 0")
        return v

# API
@app.post("/api/movements")
def create_movement(mov: MovimientoCreate) -> MovimientoResponse:
    ...
```

**Incluido con**: FastAPI

---

### 4. Pandas

**Versión**: ^2.0  
**¿Por qué?**
- Parsing de Excel/CSV (simple)
- Data manipulation (groupby, aggregation)
- Performance

**Uso**:
```python
# BN-001: Parser
df = pd.read_excel("extracto.xlsx")
df['fecha'] = pd.to_datetime(df['fecha'])
df['monto'] = pd.to_numeric(df['monto'])
```

**Dependencia**:
```
pandas==2.0.3
openpyxl==3.10.0  # Excel support
```

---

### 5. Pytest

**Versión**: ^7.0  
**¿Por qué?**
- Fixtures elegantes
- Parametrización
- Plugin ecosystem
- Coverage reporting

**Estructura**:
```
backend/
├── tests/
│   ├── conftest.py  # Fixtures globales
│   ├── test_parser.py
│   ├── test_insights.py
│   └── test_forecast.py
```

**Dependencias**:
```
pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1  # Para tests async
httpx==0.25.1  # HTTP client para tests
```

---

## Database — SQLite

### Schema Inicial

```sql
-- Categorias
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(20),  -- Ingreso, Egreso, Transferencia
    color_hint VARCHAR(7)  -- #RRGGBB
);

-- Subcategorias
CREATE TABLE subcategorias (
    id INTEGER PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    nombre VARCHAR(100) NOT NULL,
    color_hint VARCHAR(7)
);

-- Movimientos
CREATE TABLE movimientos (
    id CHAR(36) PRIMARY KEY,  -- UUID
    fecha DATE NOT NULL,
    descripcion_original TEXT,
    monto DECIMAL(15, 2) NOT NULL,
    tipo VARCHAR(20),  -- Ingreso, Egreso
    categoria_id INTEGER REFERENCES categorias(id),
    subcategoria_id INTEGER REFERENCES subcategorias(id),
    periodo VARCHAR(7),  -- YYYY-MM
    metadata_extraida JSON,
    confianza_porcentaje FLOAT,
    clasificacion_locked BOOLEAN DEFAULT 0,
    batch_id CHAR(36) REFERENCES import_batches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (fecha, descripcion_original, monto, batch_id)
);

-- Import Batches (auditoría)
CREATE TABLE import_batches (
    id CHAR(36) PRIMARY KEY,
    fecha_importacion TIMESTAMP NOT NULL,
    nombre_archivo VARCHAR(255),
    total_movimientos INTEGER,
    usuario_id VARCHAR(100),
    estado VARCHAR(20),  -- Success, Failed, Partial
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cascada Rules
CREATE TABLE cascada_rules (
    id INTEGER PRIMARY KEY,
    patron VARCHAR(255),
    categoria_id INTEGER REFERENCES categorias(id),
    subcategoria_id INTEGER REFERENCES subcategorias(id),
    prioridad INTEGER,
    source VARCHAR(20),  -- Sistema, Usuario, AI-Derived
    confidence_hint FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices**:
```sql
CREATE INDEX idx_movimientos_periodo ON movimientos(periodo);
CREATE INDEX idx_movimientos_categoria ON movimientos(categoria_id);
CREATE INDEX idx_movimientos_batch ON movimientos(batch_id);
```

---

## Frontend — Next.js

### 1. Next.js 14+

**Características usadas**:
- App Router (structure)
- Server Components (default)
- Client Components (`"use client"` cuando sea necesario)
- API routes (`app/api/*`) — optional, no se usa si tenemos FastAPI

**Estructura**:
```
frontend/
├── app/
│   ├── layout.tsx  # Layout principal
│   ├── page.tsx    # Dashboard
│   ├── reportes/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   └── api/
│       ├── proxy.ts  # (optional) proxy a FastAPI
│       └── ...
├── components/
│   ├── common/      # Button, Card, Badge
│   ├── dashboard/   # BentoGrid, UploadWidget
│   ├── reportes/    # DesgloseJerarquico
│   └── analytics/   # Charts
├── hooks/
│   ├── usePeriod.ts
│   ├── useApi.ts
│   └── useFinancialData.ts
├── services/
│   └── api.ts       # HTTP client wrapper
├── context/
│   └── PeriodContext.tsx
└── styles/
    ├── globals.css
    └── variables.css
```

**Dependencias**:
```
next==14.0.0
react==18.2.0
react-dom==18.2.0
```

---

### 2. Styling — CSS Vanilla + Variables

**¿Por qué no Tailwind?**
- Control total sobre el diseño
- Performance (sin compilación)
- Facilita transmutabilidad UI
- Consistente con preferencias

**Variables globales** (`styles/variables.css`):
```css
:root {
    --bg-primary: #000000;
    --bg-secondary: #0a0a0a;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    
    --accent-primary: #00d9ff;  /* Cian vibrante */
    --accent-secondary: #6366f1;  /* Indigo */
    
    --semantic-success: #10b981;  /* Verde */
    --semantic-danger: #ef4444;   /* Rojo */
    --semantic-warning: #f59e0b;  /* Amarillo */
    
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    
    --font-primary: 'Inter', sans-serif;
    --font-size-base: 16px;
}
```

**Dark mode**: Nativo CSS (no necesita Tailwind)

---

### 3. UI Components — shadcn/ui o Custom

**shadcn/ui** (si aplica):
- Button, Input, Card, Badge, Dialog
- Accessible (A11y)
- Customizable

**o Custom** (si el kit de marca lo requiere):
- Button.tsx
- Card.tsx
- Badge.tsx
- Input.tsx
- StatusLight.tsx (semáforo)

**Dependencias** (si shadcn):
```
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
class-variance-authority
clsx
```

---

### 4. Data Visualization — Recharts o Chart.js

**Opción A: Recharts** (recomendado para React)
```
recharts==2.10.0
```

**Opción B: Chart.js**
```
chart.js==4.4.0
react-chartjs-2==5.2.0
```

**A definir**: Cuál es más compatible con el kit de marca TORO

---

### 5. HTTP Client — Axios

**Versión**: ^1.6.0  
**¿Por qué?**
- Interceptors (agregar headers, manejo de errores global)
- Más funcional que Fetch API
- Request/response transformation

**Uso**:
```typescript
// services/api.ts
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 10000,
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Manejo global de errores
        toast.error(error.response?.data?.detail || "Error");
        throw error;
    }
);

export const apiClient = api;
```

**Dependencia**:
```
axios==1.6.0
```

---

### 6. State Management — React Context + Custom Hooks

**¿Por qué no Redux?**
- Single-user, datos no complejos
- Context API es suficiente
- Menos boilerplate

**Ejemplo: PeriodContext**
```typescript
// context/PeriodContext.tsx
interface PeriodContextType {
    period: string; // "YYYY-MM"
    setPeriod: (p: string) => void;
}

export const PeriodContext = React.createContext<PeriodContextType>(null!);

export function usePeriod() {
    const ctx = useContext(PeriodContext);
    if (!ctx) throw new Error("usePeriod must be used inside PeriodProvider");
    return ctx;
}
```

---

### 7. Testing — Vitest + React Testing Library

**Vitest**: Next-gen Vite-native test runner  
**React Testing Library**: Testing best practices

**Dependencias**:
```
vitest==1.0.0
@vitest/ui==1.0.0
@testing-library/react==14.1.0
@testing-library/jest-dom==6.1.5
@testing-library/user-event==14.5.1
jsdom==23.0.0  # DOM simulator
```

**Estructura**:
```
frontend/
├── tests/
│   ├── components/
│   │   ├── Dashboard.test.tsx
│   │   └── ReportTable.test.tsx
│   └── hooks/
│       ├── usePeriod.test.ts
│       └── useApi.test.ts
```

---

## Communication Backend ↔ Frontend

### Protocol: REST over HTTP

**Base URL**: `http://localhost:8000/api`

**Content-Type**: `application/json`

**CORS**: FastAPI configura CORS para `localhost:3000`

```python
# FastAPI CORS setup
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Development Environment

### Local Setup

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

**Database**: SQLite (toro_prime.db en raíz de backend)

---

## Versioning & Compatibility

| Componente | Versión | Lock | Motivo |
|:---|:---|:---|:---|
| Python | 3.12+ | Loose (3.12, 3.13 OK) | Estable, LTS |
| FastAPI | ^0.104 | Minor | API stable |
| SQLAlchemy | ^2.0 | Minor | ORM mature |
| Next.js | 14+ | Loose | App Router stable |
| Node.js | 18+ | Loose | LTS |

---

## Performance Targets

| Métrica | Target | Cómo medir |
|:---|:---|:---|
| API /movements response | <500ms | curl + time |
| Dashboard render | <2s | Lighthouse |
| Upload 1000 rows | <5s | File drag & drop |
| DB query (3 meses data) | <100ms | SQL timing |

---

## Security Considerations

**v1 (Single-user)**:
- No authentication
- No HTTPS (localhost)
- Data on-prem (user's machine)

**v2+ (if multi-user)**:
- JWT o OAuth2
- HTTPS enforcement
- Rate limiting
- CORS estricto

---

*Versión: 1.0*  
*Aprobación requerida*: Tori  
*Estado: FIJO (until ADR overrides)*
