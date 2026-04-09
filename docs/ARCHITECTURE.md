# Architecture — TORO_Prime

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dashboard | Reportes | Movimientos | Analytics | Insights│ │
│ └────────────────────┬────────────────────────────────────┘ │
│                      │ HTTP/REST (JSON)                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               API Gateway (FastAPI)                          │
│         http://localhost:9000/api                            │
├─────────────────────────────────────────────────────────────┤
│ Routes:                                                      │
│ • POST   /import        → ParserService                     │
│ • GET    /movements     → Query + Filter                    │
│ • GET    /insights      → InsightsService                   │
│ • GET    /forecast      → ForecastService                   │
│ • GET    /summary       → Aggregation Query                 │
│ • GET    /reports/pl    → ReportService                     │
│ • GET    /reports/periods → Period Discovery                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌────────┐  ┌────────────┐  ┌──────────┐
   │Services│  │  Models    │  │Database  │
   └────────┘  │SQLAlchemy  │  │ SQLite   │
               └────────────┘  └──────────┘
```

---

## Data Flow: Import → Process → Insights

```
1. IMPORT PHASE
═════════════════════════════════════════════════════════════
User uploads Excel
        │
        ↓
   ParserService.parse_excel()
        │
        ├─ Validate columns (fecha, descripcion, monto)
        ├─ Check duplicates (hash-based)
        └─ Insert to DB
        │
        ↓
   ImportBatch created
        │
        ├─ batch_id
        ├─ cantidad_movimientos
        └─ timestamp

2. CATEGORIZATION PHASE
═════════════════════════════════════════════════════════════
        │
        ↓
   For each Movimiento with categoria="Sin categorizar"
        │
        ├─ CategorizerService.categorize()
        │  ├─ Search CascadaRules
        │  ├─ Find best match (pattern)
        │  └─ Update: categoria, confianza
        │
        └─ If new pattern: save to CascadaRules

3. INTELLIGENCE PHASE
═════════════════════════════════════════════════════════════
        │
        ├─ On /insights call:
        │  ├─ InsightsService.generate_insights()
        │  ├─ Detect patterns (recurrencias)
        │  ├─ Detect outliers (desviación)
        │  └─ Detect context anomalies (timing)
        │
        └─ On /forecast call:
           ├─ ForecastService.forecast_3months()
           ├─ Aggregate by categoria
           ├─ Calculate monthly average
           └─ Generate 3 scenarios
```

---

## Backend Architecture: Service Layer

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (routes.py)                 │
├─────────────────────────────────────────────────────────┤
│ • Request validation (Pydantic)                          │
│ • CORS handling                                          │
│ • Error responses                                        │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────────┐
    │                     │
    ↓                     ↓
┌──────────────┐  ┌──────────────────┐
│  Services    │  │  Data Access     │
├──────────────┤  ├──────────────────┤
│              │  │                  │
│ • Parser     │  │ • Query          │
│ • Categorizer│  │ • Filter         │
│ • Insights   │  │ • Aggregate      │
│ • Forecast   │  │ • Insert/Update  │
│ • Reports    │  │                  │
└──────────────┘  └────────┬─────────┘
                           │
                    ┌──────↓──────┐
                    │  Models     │
                    ├─────────────┤
                    │             │
                    │ • Movimiento│
                    │ • ImportBatch
                    │ • CascadaRule
                    │             │
                    └─────────────┘
                           │
                    ┌──────↓──────┐
                    │  Database   │
                    ├─────────────┤
                    │  SQLite 3   │
                    │  Local file │
                    └─────────────┘
```

---

## Frontend Architecture: React Components

```
┌──────────────────────────────────────────────┐
│         RootLayout                           │
│ ├─ PeriodProvider (Global State)             │
│ ├─ ToastProvider (Notifications)             │
│ └─ Sidebar (Navigation)                      │
└────────────┬─────────────────────────────────┘
             │
    ┌────────┴─────────────┐
    │                      │
    ↓                      ↓
Dashboard             Analytics
├─ MetricCard          ├─ FlowChart
├─ RecentTransactions  ├─ CategoryPieChart
├─ InsightCard         └─ HormigaAnalysis
└─ FileUploadZone

Reportes              Movimientos              Insights
├─ HierarchicalTable  ├─ Filter Bar            └─ InsightFeed
├─ PLBreakdown        ├─ DataTable
└─ SummaryCards       └─ Drill-down
```

---

## Data Models

### Movimiento
```python
id: int (PK)
fecha: Date
descripcion: str(500)
monto: float
categoria: str(100)
subcategoria: str(100)
tipo: str(50)  # "ingreso" | "egreso"
confianza: float  # 0.0 - 1.0
created_at: DateTime
```

### ImportBatch
```python
id: int (PK)
nombre_archivo: str(255)
cantidad_movimientos: int
created_at: DateTime
```

### CascadaRule
```python
id: int (PK)
categoria: str(100) (FK)
subcategoria: str(100)
patron: str(255) (UNIQUE)
peso: float  # confidence multiplier
veces_usada: int
activo: int  # boolean
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 14+ |
| | React | 18 |
| | TypeScript | Latest |
| | CSS | Vanilla + Variables |
| **Backend** | FastAPI | 0.104+ |
| | Python | 3.12+ |
| | SQLAlchemy | 2.0+ |
| | Pydantic | 2.0+ |
| **Database** | SQLite | 3 |
| **Migration** | Alembic | 1.13+ |
| **Testing** | Pytest | 7.4+ |
| | Vitest | Latest |

---

## API-First Design

TORO_Prime sigue un **API-first** approach:

1. **Backend expone REST endpoints**
   - Todos los datos fluyen por JSON
   - No hay templates HTML del backend
   - Validación Pydantic en cada endpoint

2. **Frontend consume endpoints**
   - Single Page Application (SPA)
   - Context API para estado global
   - Fetch/Axios para HTTP

3. **No tight coupling**
   - Frontend puede cambiarse sin afectar backend
   - Backend puede escalar independientemente
   - Testing decoupled

---

## Performance Considerations

### Query Optimization
- `GET /summary`: Usa `SUM()` en DB (no descarga 500 filas)
- `GET /movements`: Indexado por `fecha`, `categoria`
- `GET /insights`: Calcula en backend (no en cliente)

### Frontend Optimization
- Dashboard carga en paralelo con `Promise.all()`
- PeriodContext cacheado
- Toast system no bloquea UI

### Database
- SQLite local (rápido para volumen actual)
- Índices en columnas críticas
- Prepared statements (SQLAlchemy)

---

## Error Handling

```
Request
  │
  ├─ Validation Error (400)
  │  └─ Pydantic validation fail
  │
  ├─ Business Logic Error (400)
  │  └─ Invalid period, missing data
  │
  ├─ Server Error (500)
  │  └─ Database exception, unexpected crash
  │
  └─ Success (200)
     └─ JSON response
```

Frontend:
- ToastProvider displays errors
- `try-catch` around API calls
- Graceful degradation (loading states)

---

*Arquitectura Actualizada: 2026-04-09*  
*Status: Production-Ready Beta*
