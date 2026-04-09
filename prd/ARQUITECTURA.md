# ARQUITECTURA.md — Arquitectura de TORO_Prime

> Documento que refleja la arquitectura del sistema.  
> Se actualiza antes de mergear cambios arquitectónicos.

---

## 1. Visión General

TORO_Prime es una plataforma de análisis financiero con **arquitectura API-First Modular**:

- **Backend**: FastAPI en Python, servicios desacoplados
- **Frontend**: Next.js con hooks y context
- **Database**: SQLite local
- **Communication**: REST JSON

El sistema es **agnóstico de período** (funciona con cualquier rango de fechas) pero el **análisis estratégico requiere 3+ meses de histórico**.

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Dashboard   │  │  Reportes    │  │  Analytics & Insights│  │
│  │  (BN-005)    │  │  (BN-006)    │  │  (BN-007)            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────────────┘  │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼──────────────┐   │
│  │    React Hooks + Context (usePeriod, useApi, etc.)       │   │
│  │                                                           │   │
│  │              HTTP Client (Axios)                         │   │
│  └────────────────────────────┬────────────────────────────┘   │
└───────────────────────────────┼────────────────────────────────┘
                                │ REST/JSON
                                │ (http://localhost:8000/api)
┌───────────────────────────────▼────────────────────────────────┐
│                       BACKEND (FastAPI)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Layer (Routes)                   │   │
│  │  POST /api/import                                       │   │
│  │  GET /api/movements                                     │   │
│  │  GET /api/insights                                      │   │
│  │  GET /api/forecast                                      │   │
│  │  GET /api/reports/pl                                    │   │
│  │  GET /api/analytics/...                                 │   │
│  └──────┬──────────────────────────────────────────────────┘   │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │            Services Layer (Business Logic)              │   │
│  │  ┌─────────────────┐  ┌──────────────┐                │   │
│  │  │ Parser Service  │  │ Categorizer  │                │   │
│  │  │ (BN-001)        │  │ (BN-001)     │                │   │
│  │  └─────────────────┘  └──────────────┘                │   │
│  │  ┌─────────────────────────────────────┐               │   │
│  │  │    Insights Engine (BN-002)         │               │   │
│  │  │  - Detecta patrones                 │               │   │
│  │  │  - Identifica outliers              │               │   │
│  │  │  - Clasifica ruido vs real          │               │   │
│  │  └─────────────────────────────────────┘               │   │
│  │  ┌─────────────────────────────────────┐               │   │
│  │  │    Forecast Engine (BN-003)         │               │   │
│  │  │  - Proyecta flujo 3 meses           │               │   │
│  │  │  - Detecta estacionalidades         │               │   │
│  │  └─────────────────────────────────────┘               │   │
│  └──────┬───────────────────────────────────────────────────┘   │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │            Data Access Layer (ORM)                      │   │
│  │  SQLAlchemy Models                                      │   │
│  │  - Movimento, Categoria, Subcategoria                  │   │
│  │  - ImportBatch, CascadaRule                            │   │
│  └──────┬───────────────────────────────────────────────────┘   │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │            SQLite Database                              │   │
│  │  movimientos, categorias, cascada_rules, import_batches │   │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura de Carpetas

```
toro-prime/
│
├── prd/                               # Documentación de especificación
│   ├── VISION.md                      # Visión estratégica
│   ├── MISION.md                      # Misión + stack + BN
│   ├── PRD.md                         # Requisitos detallados
│   ├── TECNOLOGIAS.md                 # Stack técnico (fijo)
│   ├── ARQUITECTURA.md                # Este archivo
│   └── DECISIONES.md                  # Log de ADRs
│
├── backend/                           # Python FastAPI
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # @app.get, @app.post
│   │   │   └── dependencies.py        # Inyección de dependencias
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── import_service.py      # BN-001: Parser + batch
│   │   │   ├── categorizer.py         # BN-001: Motor cascada
│   │   │   ├── insights_engine.py     # BN-002: Insights
│   │   │   └── forecast_engine.py     # BN-003: Forecasting
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base class para todos los modelos
│   │   │   ├── movimiento.py
│   │   │   ├── categoria.py
│   │   │   ├── batch.py
│   │   │   └── rule.py
│   │   │
│   │   ├── schemas/                   # Pydantic validation
│   │   │   ├── __init__.py
│   │   │   ├── movimiento.py          # MovimientoCreate, MovimientoResponse
│   │   │   ├── insight.py
│   │   │   └── forecast.py
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Env vars, settings
│   │   │   ├── constants.py           # Categorías hardcodeadas (si aplica)
│   │   │   └── utils.py               # Helper functions
│   │   │
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── session.py             # SQLAlchemy session factory
│   │   │   ├── init_db.py             # Crear tablas, datos iniciales
│   │   │   └── migrations/            # Alembic (si aplica)
│   │   │
│   │   └── main.py                    # FastAPI app, CORS, middleware
│   │
│   ├── tests/
│   │   ├── conftest.py                # Fixtures pytest
│   │   ├── test_parser.py
│   │   ├── test_categorizer.py
│   │   ├── test_insights.py
│   │   ├── test_forecast.py
│   │   └── test_api.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/                          # Next.js React
│   │
│   ├── app/                           # App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Dashboard (/)
│   │   ├── reportes/
│   │   │   └── page.tsx               # Reportes page
│   │   ├── analytics/
│   │   │   └── page.tsx               # Analytics page
│   │   └── api/
│   │       └── [...].ts               # (optional) Proxy routes
│   │
│   ├── components/
│   │   │
│   │   ├── common/                    # Átomos + Moléculas
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── StatusLight.tsx        # Semáforo
│   │   │
│   │   ├── dashboard/                 # BN-005: Dashboard
│   │   │   ├── BentoGrid.tsx          # Layout principal
│   │   │   ├── UploadWidget.tsx       # Drag & drop
│   │   │   ├── KPICard.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── reportes/                  # BN-006: Reportes
│   │   │   ├── DesgloseJerarquico.tsx # Tabla expandible
│   │   │   ├── PeriodSelector.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── analytics/                 # BN-007: Analytics
│   │   │   ├── FlowChart.tsx
│   │   │   ├── CategoriesChart.tsx
│   │   │   ├── HormigasChart.tsx
│   │   │   ├── KPIsDashboard.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── insights/                  # BN-007: Insights
│   │   │   ├── InsightCards.tsx
│   │   │   ├── InsightSummary.tsx
│   │   │   └── index.tsx
│   │   │
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   │
│   ├── hooks/                         # Custom React Hooks
│   │   ├── usePeriod.ts               # Período global
│   │   ├── useApi.ts                  # HTTP wrapper con caché
│   │   ├── useFinancialData.ts        # Fetch movimientos
│   │   ├── useInsights.ts
│   │   ├── useForecast.ts
│   │   └── useUpload.ts
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios instance + endpoints
│   │   └── formatter.ts               # Moneda, fechas, etc.
│   │
│   ├── context/
│   │   ├── PeriodContext.tsx
│   │   └── AppContext.tsx
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css              # CSS custom properties
│   │   └── components.css
│   │
│   ├── lib/
│   │   ├── utils.ts                   # Helper functions
│   │   └── constants.ts
│   │
│   ├── tests/
│   │   ├── components/
│   │   │   ├── Dashboard.test.tsx
│   │   │   └── ReportTable.test.tsx
│   │   └── hooks/
│   │       ├── usePeriod.test.ts
│   │       └── useApi.test.ts
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.example
│   └── README.md
│
├── docs/                              # Documentación técnica (post-lanzamiento)
│   ├── API_CONTRACTS.md
│   ├── SETUP.md
│   └── TROUBLESHOOTING.md
│
├── .gitignore
├── README.md (raíz)
└── docker-compose.yml                 # (optional, para local development)
```

---

## 4. Componentes y Responsabilidades

### Backend Components

#### **Import Service (BN-001)**
**Archivo**: `src/services/import_service.py`

*Responsabilidad*: Recibir Excel/CSV, parsear, detectar duplicados, crear batch.

```python
class ImportService:
    def parse_excel(file: UploadFile) -> DataFrame
    def validate_structure(df: DataFrame) -> bool
    def detect_duplicates(df: DataFrame, batch: ImportBatch) -> int
    def create_batch(df: DataFrame) -> ImportBatch
    def import_movements(batch: ImportBatch) -> int
```

---

#### **Categorizer (BN-001)**
**Archivo**: `src/services/categorizer.py`

*Responsabilidad*: Aplicar motor cascada, asignar categoría/subcategoría con confidence.

```python
class CascadaRule:
    @staticmethod
    def apply_rules(movimiento: Movimiento) -> (categoria_id, subcategoria_id, confidence)
    
    @staticmethod
    def score_rule(rule: CascadaRule, description: str) -> float
```

---

#### **Insights Engine (BN-002)**
**Archivo**: `src/services/insights_engine.py`

*Responsabilidad*: Detectar patrones, outliers, anomalías contextuales.

```python
class InsightsEngine:
    def detect_patterns(period: str) -> List[PatronRecurrente]
    def identify_outliers(period: str) -> List[Anomalia]
    def classify_noise_vs_real(anomalia: Anomalia) -> (tipo, contexto, score)
    def generate_insights(period: str) -> List[Insight]
```

---

#### **Forecast Engine (BN-003)**
**Archivo**: `src/services/forecast_engine.py`

*Responsabilidad*: Proyectar flujo 3 meses, detectar estacionalidades, calcular disponibilidad.

```python
class ForecastEngine:
    def detect_recurrences(periodo_inicio: str, periodos: int) -> List[Recurrencia]
    def project_next_3_months(base_period: str) -> List[ProjectedMonth]
    def apply_seasonality(projection: List) -> List[AdjustedProjection]
```

---

### Frontend Components

#### **Dashboard (BN-005)**
**Componentes**: `components/dashboard/`

- `BentoGrid`: Layout principal
- `UploadWidget`: Drag & drop
- `KPICard`: Tarjetas de métricas
- `RecentTransactions`: Tabla rápida

---

#### **Reportes (BN-006)**
**Componentes**: `components/reportes/`

- `DesgloseJerarquico`: Tabla expandible
- `PeriodSelector`: Filtro global

---

#### **Analytics (BN-007)**
**Componentes**: `components/analytics/`

- `FlowChart`: Gráfico de flujo
- `CategoriesChart`: Torta de categorías
- `HormigasChart`: Top 10 hormigas
- `KPIsDashboard`: KPIs de salud

---

#### **Insights (BN-007)**
**Componentes**: `components/insights/`

- `InsightCards`: Cards de insights ordenados por importancia

---

### Shared Components

#### **Hooks**
- `usePeriod()`: Período global (context)
- `useApi()`: HTTP client con caché
- `useFinancialData()`: Fetch movimientos
- `useInsights()`: Fetch insights
- `useForecast()`: Fetch forecast

---

## 5. Flujos Principales

### Flujo A: Importación & Categorización

```
1. Usuario sube Excel en Dashboard
2. Frontend: POST /api/import (file)
3. Backend:
   a. ImportService.parse_excel()
   b. Validar estructura
   c. Detectar duplicados (hash)
   d. Crear ImportBatch
   e. Para cada movimiento:
      - Extraer metadata
      - Categorizer.apply_rules()
      - Guardar en DB
4. Frontend: Toast "150 movimientos importados, 2 duplicados"
5. Dashboard actualiza (refetch movimientos)
```

---

### Flujo B: Ver Reportes P&L

```
1. Usuario navega a /reportes
2. Frontend: GET /api/movements?period=YYYY-MM
3. Backend: Query movimientos de ese período
4. Frontend: DesgloseJerarquico renderiza tabla expandible
5. Usuario expande "Servicios" → ve subcategorías y movimientos
```

---

### Flujo C: Ver Insights

```
1. Usuario navega a /analytics
2. Frontend: GET /api/insights?period=YYYY-MM
3. Backend: InsightsEngine.generate_insights()
   a. Detectar patrones (3+ meses histórico)
   b. Identificar outliers
   c. Clasificar: ruido vs real
   d. Generar insights ordenados por score
4. Frontend: InsightCards renderiza cards
5. Usuario ve: "OSPACA 2x este mes (timing, no cambio real)"
```

---

### Flujo D: Ver Forecast

```
1. Usuario navega a /analytics
2. Frontend: GET /api/forecast?meses=3
3. Backend: ForecastEngine.project_next_3_months()
   a. Detectar recurrencias del histórico
   b. Proyectar flujo
   c. Aplicar estacionalidades
   d. Calcular disponibilidad reinversión
4. Frontend: KPICard muestra "Disponible para reinversión: $50.000"
```

---

## 6. Data Flow (Movimiento de Datos)

```
Excel Upload
   ↓
ImportService.parse_excel()
   ↓
Normalize + Deduplicate
   ↓
Categorizer.apply_rules()
   ↓
Movimiento (DB)
   ↓
[Análisis]
   ├─ InsightsEngine (detecta patrones)
   ├─ ForecastEngine (proyecta)
   └─ ReportEngine (agrega)
   ↓
API Response (JSON)
   ↓
Frontend (useFetch Hook)
   ↓
React Component (Render)
   ↓
UI (Dashboard, Charts, Tables)
```

---

## 7. Decisiones Arquitectónicas Clave

| Decisión | Razón | Alternativa descartada |
|:---|:---|:---|
| API-First Modular | Desacoplado, reutilizable | Monolito: más rápido inicialmente |
| FastAPI + SQLAlchemy | Type-safe, OpenAPI nativo | Django: más pesado |
| React Hooks + Context | Suficiente para single-user | Redux: over-engineering |
| CSS Vanilla | Control total | Tailwind: menos control |
| SQLite local | Simple, no requiere servidor | Postgres: infraestructura extra |

---

## 8. Points of Integration (Futuro)

Cuando TORO_Prime se integre con otros sistemas:

```
┌─────────────────────────────────────────┐
│         HUB CENTRAL (futuro)            │
├─────────────────────────────────────────┤
│           Inputs / Outputs               │
├─────────────────────────────────────────┤
│  TORO_Prime    │  OtroSistema   │  ...  │
│  (Finanzas)    │  (RRHH, Inv)   │       │
└─────────────────────────────────────────┘

TORO_Prime expone:
- GET /api/movements         (input para análisis externo)
- GET /api/forecast          (input para planning)
- GET /api/reports/pl        (input para dashboards)
```

---

## 9. Non-Functional Properties

| Propiedad | Target | Métrica |
|:---|:---|:---|
| **Response Time** | <500ms | API latency |
| **Throughput** | 1000 movements/s | File import |
| **Availability** | 99.9% | Uptime |
| **Scalability** | 100K movements | DB size |
| **Maintainability** | >85% code coverage | Tests |

---

## 10. Security Posture (v1)

- **Authentication**: None (single-user)
- **Authorization**: None
- **Encryption**: None (local, trusted network)
- **Data Protection**: File system permissions (user responsibility)

**v2+ Considerations**:
- JWT/OAuth2 si multi-user
- HTTPS enforcement
- Rate limiting
- Input validation (Pydantic handles)

---

## 11. Deployment Architecture (v1)

```
┌─────────────────────────┐
│    User's Machine       │
├─────────────────────────┤
│  Backend (FastAPI)      │
│  :8000                  │
├─────────────────────────┤
│  Frontend (Next.js)     │
│  :3000                  │
├─────────────────────────┤
│  SQLite (toro_prime.db) │
│  /path/to/db            │
└─────────────────────────┘
```

**Startup**:
1. `cd backend && python -m uvicorn main:app --reload`
2. `cd frontend && npm run dev`
3. Open `http://localhost:3000`

---

*Versión: 1.0*  
*Propuesta por: Claude*  
*Estado: Borrador — Requiere aprobación*
