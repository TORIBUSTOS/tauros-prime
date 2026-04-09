# MISION.md — Misión Técnica de TORO_Prime

> La Misión define QUÉ vamos a construir y CON QUÉ. Es el contrato entre visión y ejecución.

---

## Definición de Misión

**Construir TORO_Prime: plataforma de análisis financiero con motor de insights inteligente que habilite decisiones estratégicas de costos, forecasting y disponibilidad de fondos.**

---

## Stack Técnico (FIJO hasta nueva ADR)

### Backend
- **Runtime**: Python 3.12+
- **Framework**: FastAPI (async, OpenAPI documentado)
- **Base de Datos**: SQLite con SQLAlchemy ORM
- **Testing**: Pytest + fixtures
- **Dependencias principales**:
  - `fastapi` ^0.104.0
  - `sqlalchemy` ^2.0
  - `pydantic` ^2.0 (validación)
  - `pandas` ^2.0 (procesamiento de extractos)
  - `python-dateutil` (manejo de fechas)
  - `pytest` ^7.0 (testing)

### Frontend
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14+ (App Router)
- **Styling**: CSS Vanilla + sistema de variables (tema TORO)
- **UI Components**: shadcn/ui o custom (a definir con kit de marca)
- **State Management**: React hooks + API context
- **Visualización**: Recharts o Chart.js (a definir)
- **HTTP Client**: Fetch API o Axios
- **Testing**: Vitest + React Testing Library

### Infraestructura
- **Versión Control**: Git + GitHub (si aplica)
- **IDE**: Claude Code (desarrollo colaborativo)
- **Deploy**: Local on-prem (sin cloud en v1)
- **Documentación**: Markdown en `/docs/`

---

## Estructura de Carpetas (TORO_Prime)

```
toro-prime/
├── prd/                    # Documentación de especificación
│   ├── VISION.md
│   ├── MISION.md
│   ├── PRD.md
│   ├── TECNOLOGIAS.md
│   ├── ARQUITECTURA.md
│   └── DECISIONES.md
│
├── backend/
│   ├── src/
│   │   ├── api/            # Endpoints FastAPI
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # SQLAlchemy + Pydantic
│   │   ├── schemas/        # Contratos de entrada/salida
│   │   ├── core/           # Motor de insights, forecasting, categorización
│   │   └── database/       # Configuración y migraciones
│   ├── tests/              # Suite de pruebas
│   ├── config/             # Variables de entorno, configuración
│   ├── main.py             # Punto de entrada
│   ├── requirements.txt    # Dependencias
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # HTTP client, API calls
│   │   ├── context/        # React Context (state global)
│   │   ├── styles/         # CSS global + variables
│   │   └── lib/            # Utilidades
│   ├── public/             # Assets estáticos
│   ├── tests/              # Tests del frontend
│   ├── package.json
│   ├── next.config.js
│   └── README.md
│
├── docs/                   # Documentación técnica (post-lanzamiento)
├── .gitignore
├── .env.example
└── README.md (raíz)
```

---

## Bloques Negros (BN) - Unidades de Trabajo

| BN | Nombre | Track | Responsable | Dependencias |
|:---|:---|:---|:---|:---|
| **BN-001** | Ingesta & Categorización Cascada | A (Backend) | Claude | (ninguna) |
| **BN-002** | Motor de INSIGHTS Inteligente | A (Backend) | Claude | BN-001 |
| **BN-003** | Forecasting 3 meses | A (Backend) | Claude | BN-001 |
| **BN-004** | API REST Contratos | A (Backend) | Claude | BN-001, BN-002, BN-003 |
| **BN-005** | Dashboard Base + Layout | B (Frontend) | Gemini | (ninguna) |
| **BN-006** | Módulo Reportes (P&L Jerárquico) | B (Frontend) | Gemini | BN-004 |
| **BN-007** | Módulo Analytics (Charts & KPIs) | B (Frontend) | Gemini | BN-004 |
| **BN-008** | Integración Frontend-Backend | B (Frontend) | Gemini | BN-004, BN-005, BN-006, BN-007 |

### Detalle de Bloques Negros

#### **BN-001: Ingesta & Categorización Cascada**
**Track A (Backend)**

*Responsable*: Claude  
*Descripción*: Parser de extractos bancarios + Motor cascada mejorado  
*Input*: Archivo Excel/CSV de extracto bancario  
*Output*: Movimientos categorizados en DB, >99% confianza  

Incluye:
- Parser de Excel/CSV (normalización de formatos)
- Detección de duplicados (hash de fecha+descripción+monto)
- Extracción de metadata (CUIT, CBU, nombres)
- Motor cascada v2.2 (rules + machine learning hints)
- Auditoría de importación (batch tracking)

---

#### **BN-002: Motor de INSIGHTS Inteligente**
**Track A (Backend)**

*Responsable*: Claude  
*Descripción*: Detección de patrones, outliers, anomalías contextuales  
*Input*: Movimientos categorizados + histórico  
*Output*: Insights estructurados (JSON), flags de anomalía  

Incluye:
- Detección de patrones recurrentes (pagos mensuales, ej: OSPACA)
- Identificación de outliers (gastos inusuales)
- **Contexto temporal**: "Este mes hay 2x OSPACA porque pagó en el siguiente mes del mes anterior"
- Clasificación de "ruido vs real" (timing vs cambio estructural)
- Scoring de anomalía (qué es importante resaltar)

---

#### **BN-003: Forecasting 3 meses**
**Track A (Backend)**

*Responsable*: Claude  
*Descripción*: Proyecciones de flujo de caja + obligaciones  
*Input*: Histórico de movimientos + input manual de obligaciones puntuales  
*Output*: Proyección JSON con confianza por concepto  

Incluye:
- Auto-detección de recurrencias (pagos mensuales, quincenales)
- Proyección de flujo (ingresos - gastos)
- Detección de estacionalidades (gastos de fin de año, etc.)
- Manual override: el usuario puede agregar obligaciones conocidas
- Cálculo de margen para contingencias

---

#### **BN-004: API REST Contratos**
**Track A (Backend)**

*Responsable*: Claude  
*Descripción*: Endpoints FastAPI documentados, contratos definidos  
*Input*: HTTP requests desde frontend  
*Output*: JSON responses validadas (Pydantic)  

Incluye:
- `POST /api/import` — subir extracto
- `GET /api/movements` — listar movimientos (con filtros)
- `GET /api/insights` — obtener insights del período
- `GET /api/forecast` — obtener forecast 3 meses
- `GET /api/reports/pl` — reporte P&L
- `GET /api/analytics/categories` — análisis por categoría
- OpenAPI doc (`/docs`)

---

#### **BN-005: Dashboard Base + Layout**
**Track B (Frontend)**

*Responsable*: Gemini  
*Descripción*: Estructura visual, sidebar, layout responsivo  
*Input*: Kit de marca TORO  
*Output*: Componentes base, landing del dashboard  

Incluye:
- Navbar/Sidebar con navegación
- Layout grid (Bento Grid o similar)
- Componentes atómicos (Button, Card, Badge, Input)
- Sistema de temas (colores, tipografía)
- Responsividad (desktop priority)

---

#### **BN-006: Módulo Reportes (P&L Jerárquico)**
**Track B (Frontend)**

*Responsable*: Gemini  
*Descripción*: Tabla expandible de ingresos/egresos, exports  
*Input*: Data de API `/api/reports/pl`  
*Output*: Tabla interactiva + descarga PDF/Excel  

Incluye:
- Tabla jerárquica (Categoría → Subcategoría → Movimientos)
- Expansión/colapso recursiva
- Filtros por período, categoría
- Descarga PDF/Excel
- Comparativa mes a mes

---

#### **BN-007: Módulo Analytics (Charts & KPIs)**
**Track B (Frontend)**

*Responsable*: Gemini  
*Descripción*: Visualizaciones de insights, KPIs, gráficos de tendencia  
*Input*: Data de API `/api/insights`, `/api/analytics/*`  
*Output*: Charts interactivos, KPIs destacados  

Incluye:
- Gráficos de flujo diario (línea)
- Torta de categorías (ingresos vs egresos)
- Top 10 "hormigas" (pequeños gastos)
- KPI cards (disponibilidad, margen, proyección)
- Alertas visuales (anomalías detectadas)

---

#### **BN-008: Integración Frontend-Backend**
**Track B (Frontend)**

*Responsable*: Gemini  
*Descripción*: Hooks, state management, API client  
*Input*: Componentes de BN-005, BN-006, BN-007  
*Output*: Aplicación funcional end-to-end  

Incluye:
- `useApi` hook (fetch con caché)
- `usePeriod` context (período global)
- `useFinancialData` (gestión de movimientos)
- Error handling y loading states
- Notificaciones (Toast, alerts)

---

## Dependencias Entre Bloques

```
BN-001 (Parser + Cascada)
   ↓
BN-002 (Insights) ← BN-003 (Forecast)
   ↓
BN-004 (API REST)
   ├→ BN-005 (Dashboard)
   ├→ BN-006 (Reportes)
   ├→ BN-007 (Analytics)
   └→ BN-008 (Integración Frontend)
```

**Paralelización:**
- **Track A**: BN-001 → (BN-002 + BN-003 en paralelo) → BN-004
- **Track B**: BN-005 → (BN-006 + BN-007 en paralelo) → BN-008
- **Integración**: BN-004 + BN-008 = Producto funcional

---

## Criterios de Éxito de la Misión

### Técnico
- ✅ Backend corre sin errores
- ✅ API tiene >90% cobertura de tests
- ✅ Frontend integra con backend sin hardcoding
- ✅ Categorización: >99% confianza en casos normales
- ✅ Insights: detecta correctamente patrones vs anomalías

### Funcional
- ✅ Extracto se importa, categoriza y visualiza (<5 segundos)
- ✅ Dashboard muestra los 3 pilares claramente
- ✅ Reportes P&L son precisos
- ✅ Forecast 3 meses es confiable (con histórico de 3+ meses)

### Arquitectura
- ✅ Código no tiene hardcoding (parámetros, catálogos en DB/config)
- ✅ API es agnóstica de períodos (funciona con N días de data)
- ✅ Hooks/servicios son reutilizables
- ✅ Base de datos es normalizada (sin redundancias)

---

## Gates Previos a Código

Antes de que Track A y Track B comiencen:

- [ ] VISION.md está aprobada (tú)
- [ ] MISION.md está aprobada (tú + Claude)
- [ ] PRD.md tiene BN detallados (Claude)
- [ ] ARQUITECTURA.md define estructura (Claude)
- [ ] CONTRATOS_API.md define endpoints (Claude)
- [ ] Kit de marca está entregado (tú) — para que Gemini pueda hacer UI

---

## Ciclo de Desarrollo

1. **Gate 1**: VISION aprobada
2. **Gate 2**: MISION + Stack confirmados
3. **Gate 3**: PRD + Contratos validados
4. **Gate 4**: Leyes de código leídas, Track A y B listos
5. **Ejecución**: BN en paralelo (Track A + Track B)
6. **Integración**: BN-004 + BN-008
7. **Validación**: Criterios de éxito cumplidos
8. **Cierre**: CHANGELOG actualizado, versión 1.0 lista

---

*Versión: 1.0*  
*Propuesta por: Claude*  
*Estado: En definición de PRD*  
*Aprobación requerida*: Tori (usuario)
