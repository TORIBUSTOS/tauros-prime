# WORKFLOW_PARALELO.md — Claude + Gemini Parallel Development

> Protocolo de coordinación para desarrollo paralelo de TORO_Prime.  
> Claude ejecuta Track A (Backend), Gemini ejecuta Track B (Frontend).

---

## Estructura Paralela

```
TORO_Prime (Inicio)
│
├─ TRACK A (Claude)                    ├─ TRACK B (Gemini)
│  ├─ BN-001: Parser                  │  ├─ BN-005: Dashboard
│  ├─ BN-002: Insights                │  ├─ BN-006: Reportes
│  ├─ BN-003: Forecast                │  ├─ BN-007: Analytics
│  └─ BN-004: API REST                │  └─ BN-008: Integration
│     (completa)                       │     (espera BN-004)
│
└─ INTEGRACIÓN (BN-008 final)
   API List + Frontend consumed
```

---

## TRACK A: Claude (Backend)

### Responsabilidad
Construir **servicios financieros autónomos** que expongan una API REST documentada.

### Bloques Negros
| BN | Tarea | Estado | Entrega |
|:---|:---|:---|:---|
| **001** | Parser + Categorización | → | Movimientos en DB, categoria automática >99% |
| **002** | Motor de INSIGHTS | → | Patrones, outliers, contexto (JSON) |
| **003** | Forecasting 3 meses | → | Proyecciones + disponibilidad (JSON) |
| **004** | API REST | ✅ | OpenAPI `/docs`, todos los endpoints testeados |

### Artefactos Clave
- `backend/src/services/` — Lógica de negocio (Parser, Insights, Forecast)
- `backend/src/models/` — SQLAlchemy ORM (Movimiento, Batch, Rule)
- `backend/src/api/routes.py` — Endpoints FastAPI
- `backend/tests/` — Pytest >85% coverage
- `backend/toro_prime.db` — SQLite local

### Commits Pattern
```
feat(BN-001): add parser and cascada categorization
feat(BN-002): implement insights engine
feat(BN-003): add forecasting service
feat(BN-004): expose API REST with OpenAPI docs
```

### Criterios de "Listo"
- ✅ API corre en `localhost:8000`
- ✅ Todos los endpoints documentados en `/docs`
- ✅ Tests coverage >85%
- ✅ Cada BN tiene test mínimo de happy-path
- ✅ DB schema creado (SQLAlchemy auto-creates)

### Handoff a Gemini
**Cuándo**: BN-004 completado (API lista)  
**Qué**: 
```bash
# Gemini necesita saber:
# 1. Cómo levantar el backend
cd backend && python -m uvicorn src.main:app --reload

# 2. Endpoints disponibles (GET http://localhost:8000/docs)
# 3. Base de datos (toro_prime.db en backend/)
# 4. Ejemplos de requests
```

---

## TRACK B: Gemini (Frontend)

### Responsabilidad
Construir **interfaz visual moderna** que consuma API de Claude con hooks/context/state.

### Bloques Negros
| BN | Tarea | Estado | Entrega |
|:---|:---|:---|:---|
| **005** | Dashboard Base | → | Layout Bento, componentes base, responsive |
| **006** | Módulo Reportes | → | Tabla jerárquica expandible, P&L visual |
| **007** | Módulo Analytics | → | Charts, KPIs, insights visualizados |
| **008** | Integración + Polish | ✅ | Hooks + API client + state, E2E funcional |

### Artefactos Clave
- `frontend/app/` — Next.js App Router (pages)
- `frontend/components/` — React components (dashboard, reportes, analytics)
- `frontend/hooks/` — Custom hooks (usePeriod, useApi, useFinancialData)
- `frontend/services/api.ts` — HTTP client (Axios)
- `frontend/context/` — React Context (global state)
- `frontend/styles/` — CSS Vanilla + variables (tema TORO)
- `frontend/tests/` — Vitest + RTL >70% coverage

### Commits Pattern
```
feat(BN-005): add dashboard with bento grid layout
feat(BN-006): implement hierarchical reports table
feat(BN-007): add analytics charts and KPI cards
feat(BN-008): integrate frontend with API, polish UI
```

### Criterios de "Listo"
- ✅ Frontend corre en `localhost:3000`
- ✅ Todas las páginas (Dashboard, Reportes, Analytics) renders
- ✅ Hooks conectados a API de Claude
- ✅ Tests coverage >70%
- ✅ CSS aplica kit de marca TORO (colores, tipografía)
- ✅ Responsive (Desktop + Tablet)

### Pre-Requisitos para Gemini
**No puede empezar BN-008 (Integration) hasta que Claude termina BN-004.**

Mientras tanto:
- **BN-005**: Puede construir Dashboard skeleton sin API
- **BN-006**: Puede construir Reportes UI sin data real (mock data)
- **BN-007**: Puede construir Analytics mock (charts con dummy data)

### Handoff desde Claude
**Cuándo**: BN-004 completado  
**Qué**:
```
POST /api/import — Upload archivo
GET /api/movements?period=YYYY-MM — Listar movimientos
GET /api/insights?period=YYYY-MM — Obtener insights
GET /api/forecast?meses=3 — Obtener forecast
GET /api/reports/pl?period=YYYY-MM — Reporte P&L
GET /api/analytics/categorias — Stats de categorías

Todos documentados en: http://localhost:8000/docs
```

---

## Sincronización & Coordinación

### Fases del Desarrollo

#### **Fase 1: Desarrollo Paralelo Independiente** (Semanas 1-2)
- **Claude**: BN-001, BN-002, BN-003 (Backend core)
- **Gemini**: BN-005, BN-006, BN-007 (Frontend mockups con dummy data)
- **Sync**: Daily async updates (commits + brief notes)

#### **Fase 2: API Completa** (Semana 3)
- **Claude**: BN-004 (Expone endpoints REST)
- **Gemini**: Mock → Real integration (reemplaza dummy data con API calls)
- **Sync**: Gemini consume endpoints de Claude, reporta issues

#### **Fase 3: Integración & Polish** (Semana 4)
- **Claude**: Bug fixes, optimización DB, testing exhaustivo
- **Gemini**: BN-008 (Hooks, state management, UI refinement)
- **Sync**: Daily sync, resolver blockers juntos

#### **Fase 4: E2E Testing & Launch** (Semana 5)
- **Ambos**: Testing end-to-end (usuario sube archivo → ve reportes)
- **Ambos**: Bug fixes, performance tuning
- **Sync**: Standup diario

---

## Dependencias & Blockers

### Criticidades
| Dependencia | Quién depende | Bloqueado hasta | Alternativa (Mock) |
|:---|:---|:---|:---|
| API `/api/import` | Gemini BN-008 | Claude BN-004 | POST mock, devuelve batch_id fake |
| API `/api/movements` | Gemini BN-006 | Claude BN-004 | Mock con 100 movimientos dummy |
| API `/api/insights` | Gemini BN-007 | Claude BN-004 | Mock insights (3-5 cards hardcoded) |
| API `/api/forecast` | Gemini BN-007 | Claude BN-004 | Mock forecast (3 meses estáticos) |
| Database schema | Claude BN-002+ | Claude BN-001 | ✅ Auto-created by SQLAlchemy |

### Resolución de Blockers
Si Gemini se bloquea esperando API:
1. **Usar mock data** en componentes (estrategia de Fase 1)
2. **Chat async** con Claude: "Necesito endpoint X para hacer Y"
3. **Implementar en paralelo** si no hay API aún

Si Claude tiene bug en API:
1. **Gemini sigue con mocks** (no bloqueado)
2. **Claude arregla en BN-004**
3. **Gemini swapea mock → real** cuando esté listo

---

## Rama & Commits

### Git Strategy
```
main (always working)
├── claude/BN-001  (Branch para Claude BN-001)
├── claude/BN-002
├── claude/BN-003
├── claude/BN-004
├── gemini/BN-005  (Branch para Gemini BN-005)
├── gemini/BN-006
├── gemini/BN-007
└── gemini/BN-008
```

### Merge Strategy
- **Cada BN es un PR** (Pull Request)
- **Code review simple**: Tori approva si funciona
- **Merge a main** cuando pase tests
- **No hay merge conflicts** (Backend y Frontend son carpetas separadas)

### Commit Pattern
```bash
# Claude Backend
git commit -m "feat(BN-001): add parser service

- Parse Excel/CSV to DataFrame
- Normalize data (dates, amounts, descriptions)
- Create ImportBatch records
- Test coverage: 100% parser, 85% overall"

# Gemini Frontend
git commit -m "feat(BN-005): add dashboard layout with bento grid

- Create BentoGrid component
- Add UploadWidget (drag & drop)
- Add KPI cards skeleton
- Test coverage: 70% components"
```

---

## Daily Sync Protocol

### Formato de Update (Async)
Cada agente publica diariamente:

**Formato: `<agente> BN-XXX Update`**

```
Claude BN-002 Update:
✅ Completed: Insights pattern detection (tests passing)
🔄 In Progress: Outlier classification logic
⚠️ Blocker: None
📅 Tomorrow: Finish anomaly classification, start forecast service
🔗 Commits: feat(BN-002): add pattern detection #abc123
```

```
Gemini BN-006 Update:
✅ Completed: DesgloseJerarquico component (expandible table)
🔄 In Progress: Conectar a /api/movements (espera API)
⚠️ Blocker: Necesito schema exacto de response de /api/movements
📅 Tomorrow: Implement filters, sort by category
🔗 Commits: feat(BN-006): add hierarchical table #def456
```

### Reunión Semanal (Viernes)
- **15 minutos**: Tori + Claude + Gemini
- Revisar avance de ambos tracks
- Resolver blockers juntos
- Planear semana siguiente

---

## Testing & QA

### Backend (Claude)
- **Unit tests**: Cada servicio (parser, insights, forecast)
- **Integration tests**: API ↔ Database
- **E2E tests**: Upload file → categorize → visualize insights
- **Coverage**: >85% código crítico

### Frontend (Gemini)
- **Component tests**: Cada componente (Button, Card, Table)
- **Hook tests**: usePeriod, useApi, useFinancialData
- **Integration tests**: Frontend ↔ API (cuando esté lista)
- **Coverage**: >70% componentes principales
- **Visual**: Responsive en Desktop + Tablet, tema TORO aplicado

### E2E (Ambos Juntos)
```
1. User sube Excel en Dashboard (Gemini Frontend)
2. Frontend POST /api/import (Claude API)
3. Backend parsea, categoriza, guarda en DB (Claude BN-001)
4. Frontend GET /api/movements (Claude API)
5. Frontend muestra tabla de movimientos (Gemini BN-006)
6. Frontend GET /api/insights (Claude API)
7. Frontend muestra insights cards (Gemini BN-007)
```

---

## Success Criteria (Fase 5 - Launch)

| Criterio | Claude | Gemini |
|:---|:---|:---|
| **Funcionalidad** | API completa, >99% categorización | UI funcional, responsive |
| **Testing** | >85% coverage, 0 critical bugs | >70% coverage, 0 critical bugs |
| **Performance** | API <500ms, upload <5s | Dashboard renders <2s |
| **Documentación** | OpenAPI `/docs`, readme | Componentes documentados |
| **Code Quality** | No hardcoding, small functions | No hardcoding, reusable hooks |
| **Git** | Clean history, descriptive commits | Clean history, descriptive commits |

---

## Contingencies

### Si Claude se atrasa (BN-002, BN-003)
- ✅ **Gemini no bloqueado**: Continúa con BN-005, 006, 007 en mock
- ✅ **Gemini entiende API contracts**: Lee PLAN_IMPLEMENTACION.md
- ✅ **Cuando API esté lista**: Swap mock → real sin refactoring grande

### Si Gemini se atrasa (BN-005, BN-006)
- ✅ **Claude no bloqueado**: Continúa con lógica de backend
- ✅ **Claude puede testear API con curl/Postman**
- ✅ **Cuando Frontend esté listo**: Conecta con API terminada

### Si hay disagreement en design
- 📞 **Quick sync**: Tori + agente que propone + agente que objeción
- 🎯 **Decisión**: Tori decide (es su proyecto)
- ✍️ **Documento**: Agregar a DECISIONES.md como ADR

---

## Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────┐
│ TORO_Prime: Desarrollo Paralelo Claude (Backend) + Gemini (Frontend)
├─────────────────────────────────────────────────────────────┤
│ Track A (Claude):              Track B (Gemini):             │
│ • BN-001: Parser              • BN-005: Dashboard            │
│ • BN-002: Insights            • BN-006: Reportes             │
│ • BN-003: Forecast            • BN-007: Analytics            │
│ • BN-004: API REST            • BN-008: Integration          │
│                                                               │
│ Dependencia: BN-004 → BN-008                                │
│ Mocks: Gemini puede avanzar sin API (Fase 1-2)             │
│                                                               │
│ Sync: Daily async + Friday standup                          │
│ Timeline: 4-5 semanas (etapas relajadas)                    │
│ Success: E2E funcional, coverage >80%, 0 critical bugs      │
└─────────────────────────────────────────────────────────────┘
```

---

*Versión: 1.0*  
*Aprobado por: Tori*  
*Fecha: 2026-04-08*  
*Próxima revisión: Semana 1 (Viernes standup)*
