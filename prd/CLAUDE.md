# CLAUDE.md — Briefing para Claude en TORO_Prime

> Contexto de trabajo para Claude sessions en este proyecto.  
> Léelo al iniciar, actualiza si descubres nuevos patrones.

---

## Protocolo TORO LAB v2

Este proyecto **SIGUE ESTRICTAMENTE** el Protocolo TORO LAB v2:

- **Gates** (4): Validación progresiva antes de código
- **Bloques Negros** (8): Unidades de trabajo independientes
- **ADRs**: Decisiones arquitectónicas documentadas en `DECISIONES.md`
- **Tracks**: A (Backend/Claude) + B (Frontend/Gemini) en paralelo

**Documentos base** (léelos en orden):
1. `VISION.md` — Visión estratégica, 3 pilares, diferenciador
2. `MISION.md` — Stack + BN + dependencias
3. `PRD.md` — Requisitos detallados
4. `ARQUITECTURA.md` — Diseño del sistema
5. `DECISIONES.md` — Log de ADRs (FIJO hasta nueva ADR)
6. `TECNOLOGIAS.md` — Stack detallado (FIJO)

---

## Stack Técnico (FIJO - No cambiar sin ADR)

### Backend (Track A)
- **Runtime**: Python 3.12+
- **Framework**: FastAPI ^0.104
- **ORM**: SQLAlchemy ^2.0
- **Database**: SQLite v3 (local)
- **Validation**: Pydantic v2
- **Data Processing**: Pandas ^2.0
- **Testing**: Pytest ^7.0, >85% coverage

### Frontend (Track B)
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18 + Hooks + Context API
- **Styling**: CSS Vanilla + CSS Variables
- **HTTP**: Axios ^1.6
- **Testing**: Vitest + React Testing Library, >70% coverage

### Communication
- **Protocol**: REST/JSON
- **Base URL**: `http://localhost:8000/api`
- **CORS**: FastAPI configura para `localhost:3000`

---

## El Diferenciador: Motor de INSIGHTS Inteligente

**TORO_Prime NO es**: "Dashboard bonito que ordena extractos bancarios"

**TORO_Prime SÍ es**: Plataforma que entrega **INSIGHTS ESTRATÉGICOS REALES**

### Ejemplo: OSPACA (Obra Social)
- ❌ **TAUROS diría**: "OSPACA es 40% de ingresos, categoria más grande"
- ✅ **TORO_Prime dice**: "OSPACA este mes: 2x su monto normal porque pagó en el siguiente mes del anterior. No es cambio estructural, es timing."

### Clave
- **Filtra RUIDO**: anomalías de timing, calendario, desfasajes puntuales
- **Resalta REAL**: cambios en patrones, nuevas recurrencias, riesgos de liquidez

---

## Arquitectura Base: API-First Modular

```
Frontend (Next.js)
   ↓ HTTP/REST
Backend (FastAPI)
   ├── Services (Import, Categorizer, Insights, Forecast)
   ├── Models (SQLAlchemy)
   └── Database (SQLite)
```

**No hay hardcoding**. Todos los valores viven en:
- `config/` (env vars)
- Database (categorías, reglas, configuraciones)
- Schemas (validación Pydantic)

---

## Bloques Negros (8 Unidades de Trabajo)

| BN | Nombre | Track | Descripción |
|:---|:---|:---|:---|
| **001** | Parser + Categorización | A | Ingesta de Excel/CSV, motor cascada >99% confianza |
| **002** | Motor de INSIGHTS | A | Detecta patrones, outliers, anomalías contextuales |
| **003** | Forecasting 3 meses | A | Proyecciones automáticas + manual |
| **004** | API REST | A | Endpoints OpenAPI documentados |
| **005** | Dashboard Base | B | Layout Bento Grid, componentes base |
| **006** | Reportes (P&L) | B | Tabla jerárquica expandible |
| **007** | Analytics | B | Charts, KPIs, visualización de insights |
| **008** | Integración Frontend | B | Hooks, API client, state management |

**Dependencias**:
```
BN-001 → (BN-002 + BN-003) → BN-004
                   ↓
         BN-005 → (BN-006 + BN-007) → BN-008
```

---

## Principios de Código

### 1. Sin Hardcoding
```python
# ❌ NO
if categoria == "Prestadores":
    print("Error: manual entry")

# ✅ SÍ
MANUAL_CATEGORIES = {"Prestadores", "Otros"}  # En config
if categoria in MANUAL_CATEGORIES:
    # Handle manual entry
```

### 2. Funciones Pequeñas
- Una responsabilidad por función
- Testeable en aislamiento
- Nombre describe qué hace

```python
# ❌ NO
def process_file(file):
    # Parse, validate, categorize, save (4 responsabilidades)

# ✅ SÍ
def parse_excel(file) -> DataFrame
def validate_structure(df) -> bool
def categorize(movement) -> Category
def save(batch) -> int
```

### 3. Type Safety
```python
# ✅ Siempre type hints
def detect_patterns(periodo: str) -> List[PatronRecurrente]:
    ...

# ✅ Pydantic schemas
class MovimientoCreate(BaseModel):
    fecha: date
    monto: Decimal
```

### 4. Testing First
- Backend: >85% coverage (Pytest)
- Frontend: >70% coverage (Vitest)
- Critical paths: 100% (parser, insights, forecast)

```bash
# Backend
pytest -v --cov=src tests/

# Frontend
npm test -- --run --coverage
```

---

## Agnóstico de Período

**IMPORTANTE**: TORO_Prime no requiere data mensual completa.

- **Análisis Ágil** (movimientos, charts, categorización): Funciona con N días
- **Análisis Estratégico** (insights, forecast, patrones): Requiere 3+ meses histórico
- Sistema avisa: "Tienes 2 meses, forecast confianza baja"

**Ejemplo**:
- Upload 15 días → charts funcionan, insights parciales
- Upload 3 meses → análisis completo, forecast confiable

---

## Decisiones Clave (ADRs)

Ver `DECISIONES.md` para detalles. Resumen:

| ADR | Decisión | Razón |
|:---|:---|:---|
| **001** | Protocolo TORO LAB v2 | Estructura clara, Gates, Bloques Negros |
| **002** | API-First Modular | Desacoplado, reutilizable, testeable |
| **003** | FastAPI + SQLAlchemy + SQLite | Type-safe, simple, Python-centric |
| **004** | Next.js + CSS Vanilla | Control total, performance, transmutabilidad |
| **005** | Single-user, local-only | No auth, no cloud, datos privados |
| **006** | Agnóstico de período | Flexible, user-friendly |
| **007** | Motor cascada mejorado | >99% confianza en casos normales |
| **008** | >80% testing coverage | Confianza en código crítico |
| **009** | Documentación de Ley | Codebase navigable, decisiones capturadas |
| **010** | Protocolo TORO LAB v2 | Gates + Bloques Negros + Tracks paralelos |

---

## Comandos Útiles

### Backend Setup & Run
```bash
cd backend

# Install dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run server (reload on save)
python -m uvicorn main:app --reload --port 8000

# Tests with coverage
pytest -v --cov=src tests/

# Format code (if applicable)
black src/ tests/
```

### Frontend Setup & Run
```bash
cd frontend

# Install dependencies
npm install

# Dev server (http://localhost:3000)
npm run dev

# Tests
npm test -- --run

# Build
npm run build
```

### Database
```bash
# SQLite location: backend/toro_prime.db
# No migrations needed for v1 (SQLAlchemy creates tables)
# If needed: use Alembic (setup in backend/database/migrations/)
```

---

## Estructura de Carpetas Esperada

```
toro-prime/
├── prd/                          # Documentación (este directorio)
│   ├── VISION.md
│   ├── MISION.md
│   ├── PRD.md
│   ├── TECNOLOGIAS.md
│   ├── ARQUITECTURA.md
│   ├── DECISIONES.md
│   └── CLAUDE.md                 # Este archivo
│
├── backend/
│   ├── src/
│   │   ├── api/                  # Routes (FastAPI)
│   │   ├── services/             # Business logic (BN-001 a BN-003)
│   │   ├── models/               # SQLAlchemy ORM
│   │   ├── schemas/              # Pydantic validation
│   │   ├── core/                 # Config, constants, utils
│   │   ├── database/             # Session, init, migrations
│   │   └── main.py               # FastAPI app
│   ├── tests/                    # Pytest
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components (BN-005 a BN-007)
│   ├── hooks/                    # Custom hooks (usePeriod, useApi, etc.)
│   ├── services/                 # HTTP client, formatters
│   ├── context/                  # React Context (state global)
│   ├── styles/                   # CSS + variables
│   ├── lib/                      # Utils, constants
│   ├── tests/                    # Vitest + RTL
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.example
│   └── README.md
│
├── docs/                         # Documentación técnica (post-lanzamiento)
├── .gitignore
└── README.md (raíz)
```

---

## User Preferences (Tori)

**Trabajar con Tori**:
- No es Dev → confía en recomendaciones técnicas
- UI/UX es su dominio → él decide componentes, layouts, colores
- Etapas, no timelines → "Hoy hago 1 etapa, mañana quizás 2 o ninguna"
- Acepta mejoras sugeridas → Si las justifico, las implementa
- Token-aware → Scripts en lugar de web graphics

**Cómo trabajar**:
1. Propongo solución técnica
2. Explico trade-offs
3. Él aprueba o pide cambios
4. No hay sorpresas

---

## Riesgos Conocidos & Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|:---|:---|:---|:---|
| Categorización imprecisa (edge cases) | Media | Alto | Más reglas, user feedback loop, testing exhaustivo |
| Motor insights genera false positives | Media | Medio | Threshold tuning, contexto detection, testing |
| Forecast poco confiable con poco histórico | Alta | Bajo | Avisa confianza baja, permite ajustes manuales |
| UI no refleja kit de marca | Baja | Medio | Revisión temprana con Tori |
| SQLite límite de escala (100K+ rows) | Baja | Alto | OK para v1 local, migrar a Postgres si crece |

---

## Próximas Sesiones

**Si esto es tu primer contacto con TORO_Prime**:
1. Lee `VISION.md` (5 min)
2. Lee `MISION.md` (10 min)
3. Lee `ARQUITECTURA.md` (10 min)
4. Lee `DECISIONES.md` summary (5 min)
5. Ve a `TECNOLOGIAS.md` si necesitas detalles técnicos

**Si es desarrollo**: Ve directo a `PRD.md` + tu BN asignado

---

## Cuando Actualizar Este CLAUDE.md

Actualiza si descubres:
- Patrones de código nuevos (comandos útiles, tricks)
- Gotchas o configuraciones especiales
- User preferences que no están documentadas
- Cambios en el proceso (nuevos Gates, BN, etc.)

**NO actualices**: Cosas obvias, one-off fixes, documentación que ya vive en ARQUITECTURA.md

---

*Versión: 1.0*  
*Última actualización: 2026-04-08*  
*Responsable: Claude*  
*Si el código y este documento no coinciden, este está desactualizado.*
