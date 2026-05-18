# Architecture — TAUROS v2

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
│ • GET    /insights      → InsightsService (legacy feed)     │
│ • /insights-engine/*    → InsightsEngineService             │
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

## Data Flow: Import -> Process -> Insights

```
1. IMPORT PHASE
═════════════════════════════════════════════════════════════
User uploads Excel/CSV
        │
        ↓
   ParserService.parse_excel()
        │
        ├─ Accept normalized format (fecha, descripcion, monto)
        ├─ Accept Supervielle raw format
        │  └─ Fecha + Concepto + Detalle + Debito + Credito
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
        ├─ On /insights call (legacy UI feed):
        │  ├─ InsightsService.generate_insights()
        │  ├─ Detect patterns (recurrencias)
        │  ├─ Detect outliers (desviación)
        │  └─ Detect context anomalies (timing)
        │
        ├─ On /insights-engine/evaluate call:
        │  ├─ Load config/insight_rules.json
        │  ├─ Evaluate period against baseline
        │  ├─ Persist InsightCandidate
        │  └─ Track review status
        │
        └─ On /forecast call:
           ├─ ForecastService.forecast_3months()
           ├─ Use previous annual baseline
           ├─ Aggregate by categoria/subcategoria
           ├─ Classify structural/seasonal/manual/extraordinary
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
│ • InsightsEngine││ • Persist trace │
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
                    │ • InsightCandidate
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
│ ├─ ToastProvider (Global Notifications)      │
│ └─ Sidebar & MobileNav (Navigation)         │
└────────────┬─────────────────────────────────┘
             │
    ┌────────┴─────────────┐
    │                      │
    ↓                      ↓
Dashboard             Analytics
├─ MetricCard          ├─ FlowChart
├─ RecentTransactions  ├─ CategoryPieChart
├─ ForecastChart [NEW] ├─ ForecastChart [NEW]
├─ InsightCard         └─ HormigaAnalysis (Pro)
└─ FileUploadZone

Reportes              Movimientos              Insights
├─ HierarchicalTable  ├─ Filter Bar            └─ InsightFeed
├─ PLBreakdown        ├─ DataTable
└─ SummaryCards       └─ Drill-down (Modal)
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

### InsightCandidate
```python
id: int (PK)
candidate_uid: str(64)  # idempotency key
tipo: str(50)  # kpi | alerta | insight | anomalia | revision_manual
titulo: str(255)
descripcion: str
severidad: str(20)
periodo_analizado: str(7)
regla_disparadora: str(120)
datos_utilizados: JSON text
explicacion: str
accion_sugerida: str
estado_revision: str  # pending | approved | rejected | ignored | converted_to_rule
created_at: DateTime
updated_at: DateTime
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

## Current Data Baseline

Estado operativo al 2026-05-18:

| Periodo | Movimientos | Sin categoria |
|---|---:|---:|
| 2025-05 | 608 | 0 |
| 2025-06 | 630 | 0 |
| 2025-07 | 527 | 0 |
| 2025-08 | 586 | 0 |
| 2025-09 | 412 | 0 |
| 2025-10 | 461 | 0 |
| 2025-11 | 507 | 0 |
| 2025-12 | 527 | 0 |
| 2026-01 | 488 | 0 |
| 2026-02 | 428 | 0 |
| 2026-03 | 505 | 1 |
| 2026-04 | 493 | 0 |

Total: 6.172 movimientos. Duplicados exactos: 0.

La unica excepcion sin categoria aceptada es `DOCUMENTO 27963963144` en marzo 2026.

## Current Insights Baseline

Estado SP8 al 2026-05-18:

- Canon inicial en `config/insight_rules.json`.
- 160 candidatos persistidos sobre mayo 2025 - abril 2026.
- 24 candidatos `pending` para revision humana.
- 136 candidatos `ignored` como KPI/baseline esperado.
- Variaciones evaluadas por `category_subcategory` para evitar insights demasiado amplios.
- SP9 incorpora bandeja de revision en `/auditoria` y registra cambios de estado en `audit_logs`.

## Current Forecast Baseline

Estado SP10 al 2026-05-18:

- El forecast usa solo movimientos anteriores al periodo proyectado.
- Horizonte de 3 meses.
- Baseline maximo de 12 meses.
- Cada item expone `metadata.forecast_class`: `structural`, `seasonal`, `manual` o `extraordinary`.
- `scenarios.realistic` incluye `structural_3m` y `extraordinary_3m`.

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

---

## UI/UX Patterns

### Global Notification System (Toasts)
- **Engine**: Framer Motion (AnimatePresence)
- **Context**: `ToastContext` centraliza el envío de mensajes desde cualquier componente.
- **Aesthetics**: "Imperial Tech" (Glassmorphism + Gold/Bronze accents).

### Mobile Strategy
- **Adaptive Layout**: El Sidebar se oculta en `< 1024px`.
- **Bottom Navigation**: Barra persistente para acceso rápido a las secciones principales.
- **Responsive Charts**: Contenedores dinámicos (`min-h-[300px]`) que se adaptan a la orientación del dispositivo.

---

*Arquitectura Actualizada: 2026-05-18*
*Status: SP10 cerrado; forecast real listo para SP11 Ejecutivo*
