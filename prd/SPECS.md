# SPECS.md — Especificaciones Técnicas Detalladas de TORO_Prime

> Documento de especificaciones que operacionaliza VISION.md + ARQUITECTURA.md  
> Define interfaces exactas, flujos de datos, y criterios de aceptación.

---

## 1. Resumen Ejecutivo

TORO_Prime v1 implementa 3 pilares estratégicos (Optimización de Costos, Forecasting, Disponibilidad de Fondos) a través de:

| Bloque Negra | Componente | Entrada | Salida | Owner |
|:---|:---|:---|:---|:---|
| **BN-001** | Parser + Categorización | Excel/CSV | Movimientos categorizados | Claude |
| **BN-002** | Motor de Insights | Histórico 3+ meses | 10-15 insights/período | Claude |
| **BN-003** | Forecasting | Histórico 3+ meses | Proyecciones 3 meses | Claude |
| **BN-004** | API REST | Servicios BN-001-003 | OpenAPI documentada | Claude |
| **BN-005** | Dashboard Base | API BN-004 | Layout Bento 6-9 cards | Gemini |
| **BN-006** | Reportes P&L | API BN-004 | Tabla jerárquica | Gemini |
| **BN-007** | Analytics | API BN-004 | Charts + KPIs | Gemini |
| **BN-008** | Integración | BN-005/006/007 | UX completa | Gemini |

---

## 2. Especificaciones de Entrada/Salida

### BN-001: Parser + Categorización

#### 2.1.1 Ingesta de Datos

**Formato Aceptado**: Excel (.xlsx), CSV (.csv)

**Estructura Esperada**:
```
Columna A: fecha (DD/MM/YYYY o YYYY-MM-DD)
Columna B: descripcion (string, 1-255 chars)
Columna C: monto (float, puede ser negativo)
```

**Transformaciones Especiales**:
- Supervielle: Débito/Crédito (2 columnas) → monto (monto_neto = Crédito - Débito)
- Trimestre incompleto: OK (sistema advierte confianza baja en insights)

**Validaciones**:
```python
def validate_import(df: DataFrame) -> Tuple[bool, List[str]]:
    """
    Retorna (es_válido, lista_errores)
    Errores: columnas faltantes, fechas inválidas, montos NaN
    """
```

**Deduplicación**:
- Hash: `MD5(fecha|descripcion|monto)`
- Si existe en DB → SKIP (log de duplicado)
- Si NO existe → INSERT

---

#### 2.1.2 Motor de Categorización Cascada

**Entrada**: `Movimiento(fecha, descripcion, monto, batch_id)`

**Proceso**:
```
1. Normalizar descripción
   - Eliminar puntos: "I.V.A." → "iva"
   - Minúsculas
   - Espacios múltiples → 1

2. Iterar reglas (ordenadas por peso DESC)
   IF descripción_norm CONTAINS patrón:
      - categoria = regla.categoria
      - confianza = regla.peso / 100.0
      - activo = 1
      BREAK

3. Si no match:
   - categoria = "Sin categorizar"
   - confianza = 0.0
```

**Tabla `cascada_rules`**:
```sql
CREATE TABLE cascada_rules (
    id INTEGER PRIMARY KEY,
    patron TEXT UNIQUE NOT NULL,       -- Substring a buscar (case-insensitive)
    categoria TEXT NOT NULL,            -- Categoría destino
    subcategoria TEXT,                  -- (Opcional)
    peso INTEGER DEFAULT 50,            -- 1-100, usado para confianza
    veces_usada INTEGER DEFAULT 0,      -- Stats
    activo INTEGER DEFAULT 1,           -- 0 = soft-delete
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Salida**: `Movimiento(categoria="...", confianza=0.75, ...)`

---

### BN-002: Motor de Insights

#### 2.2.1 Detección de Patrones Recurrentes

**Input**: `periodo: str` (YYYY-MM), `movimientos: List[Movimiento]`

**Lógica**:
1. **Agrupar por descripción normalizada** (categorización cascada)
2. **Detectar frecuencia**:
   - Semanal: 4-5 apariciones en 30 días
   - Bisemanal: 2-3 apariciones
   - Mensual: 1 aparición (pero en meses anteriores también)
3. **Clasificar**:
   - Patrón recurrente: ≥3 períodos, variación ±20%
   - Outlier: Monto > 3σ de la media
   - Anomalía contextual: Cambio vs promedio histórico

#### 2.2.2 Estructura de Insight

```python
class Insight(BaseModel):
    type: str  # "pattern" | "outlier" | "context_anomaly"
    
    # Patrón recurrente
    description: str
    expected_monthly: float
    actual_monthly: float
    frequency: str  # "weekly" | "biweekly" | "monthly"
    confidence: float  # 0.50-0.95
    
    # Outlier
    value: float
    z_score: float
    reason: str
    
    # Anomalía contextual
    context: str  # "timing" | "category_shift" | "new_recurrence"
    historical_avg: float
    current_value: float
    pct_change: float
```

**Salida**: `List[Insight]` (10-15 por período típicamente)

---

### BN-003: Forecasting de 3 Meses

#### 2.3.1 Entrada

`desde: str (YYYY-MM)` — Mes inicial de proyección

#### 2.3.2 Proceso

```
1. Validar histórico (≥3 meses)
   IF <3 meses → confianza = 0.3, usar default scenarios

2. Agrupar movimientos por (descripción_norm, categoría)

3. Para cada grupo, detectar patrón:
   - Frecuencia (semanal/bisemanal/mensual)
   - Monto promedio
   - Variación estándar

4. Proyectar 3 meses:
   - Escenario realista: promedio ± 0σ
   - Escenario optimista: promedio - 1σ (menos gastos)
   - Escenario pesimista: promedio + 1σ (más gastos)

5. Sumar por mes y por escenario
```

#### 2.3.3 Salida

```python
class ForecastMonth(BaseModel):
    month: str  # "2025-06"
    realistic: float
    optimistic: float
    pessimistic: float
    confidence: float  # 0.50-0.95

class ForecastResponse(BaseModel):
    desde: str
    hasta: str
    forecast: List[ForecastMonth]
    scenarios: Dict[str, float]  # {"realistic": X, "optimistic": Y, ...}
    confidence: float
```

---

### BN-004: API REST

#### 2.4.1 Endpoints Críticos

##### POST `/api/import`
```
Carga archivo Excel/CSV con movimientos bancarios.

Request:
  Content-Type: multipart/form-data
  - file: Binary Excel/CSV
  
Response 200:
  {
    "batch_id": "uuid",
    "total": 653,
    "categorized": 650,
    "pct_categorized": 99.5,
    "duplicates_skipped": 3,
    "time_ms": 1750
  }
```

##### GET `/api/movements`
```
Recupera movimientos con filtros opcionales.

Query Params:
  - period: YYYY-MM (filtro por período)
  - categoria: string (filtro por categoría)
  - limit: int (default 500, max 500)
  
Response 200:
  [
    {
      "id": 1,
      "fecha": "2025-06-15",
      "descripcion": "OSPACA Aporte",
      "monto": 12500,
      "categoria": "Ingresos",
      "confianza": 0.95
    },
    ...
  ]
```

##### GET `/api/insights`
```
Genera insights inteligentes para un período.

Query Params:
  - period: YYYY-MM (obligatorio)
  
Response 200:
  {
    "period": "2025-06",
    "insights": [
      {
        "type": "pattern",
        "description": "OSPACA Aporte",
        "expected_monthly": 12500,
        "actual_monthly": 25000,
        "frequency": "monthly",
        "confidence": 0.85,
        "reason": "OSPACA pagó 2x este mes (timing desfasado)"
      },
      ...
    ],
    "total": 14,
    "confianza_promedio": 0.78
  }
```

##### GET `/api/forecast`
```
Proyecciones de 3 meses a partir de un período.

Query Params:
  - desde: YYYY-MM (obligatorio)
  
Response 200:
  {
    "desde": "2025-07",
    "hasta": "2025-09",
    "forecast": [
      {
        "month": "2025-07",
        "realistic": 150000,
        "optimistic": 160000,
        "pessimistic": 140000,
        "confidence": 0.82
      },
      ...
    ],
    "scenarios": {
      "realistic": 450000,
      "optimistic": 480000,
      "pessimistic": 420000
    },
    "confidence": 0.82
  }
```

##### GET `/api/health`
```
Health check básico.

Response 200:
  { "status": "ok" }
```

#### 2.4.2 Errores Estándar

```python
HTTP 400: BadRequest
  {
    "detail": "period parameter is required"
  }

HTTP 404: NotFound
  {
    "detail": "No movements found for period 2025-06"
  }

HTTP 422: UnprocessableEntity (validación Pydantic)
  {
    "detail": [
      {
        "loc": ["body", "fecha"],
        "msg": "invalid date format",
        "type": "value_error"
      }
    ]
  }

HTTP 500: InternalServerError
  {
    "detail": "Database connection failed"
  }
```

---

## 3. Especificaciones de Componentes Frontend

### BN-005: Dashboard Base

#### 3.1.1 Layout

**Grid System**: CSS Grid 3 columnas (1200px width responsiva)

**Cards Obligatorias**:
1. **Resumen de Período** (2 cols, span 1 row)
   - Ingresos totales
   - Egresos totales
   - Balance neto
   - Transacciones

2. **Top Categorías** (1 col, span 2 rows)
   - Listado ordenado por gasto
   - Click → expand subcategorías

3. **Flujo Mensual** (2 cols)
   - LineChart: Ingresos vs Egresos por período

4. **Distribución de Gastos** (1 col)
   - PieChart por categoría

5. **Insights Dinámicos** (2 cols)
   - Cards con alerts de patrones detectados

#### 3.1.2 Responsividad

```css
/* Desktop */
@media (min-width: 1200px) {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet */
@media (max-width: 1199px) {
  grid-template-columns: repeat(2, 1fr);
}

/* Mobile */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

---

### BN-006: Reportes P&L

#### 3.2.1 Estructura

**Tabla Jerárquica Expandible**:
```
├── INGRESOS
│  ├── Ingresos Operacionales
│  │  ├── OSPACA Aportes
│  │  ├── Otros Servicios
│  └── Subtotal: $150,000
│
├── EGRESOS
│  ├── Operacionales
│  │  ├── Servicios
│  │  ├── Salarios
│  └── Subtotal: $100,000
│
└── NETO: $50,000
```

**Funcionalidad**:
- Click en fila → expandir subcategorías
- Orden: Manual (configurable) o por monto DESC
- Cada fila muestra: Categoría | Monto | % del Total

#### 3.2.2 Exportación

- Botón "Descargar PDF" → PDF con tabla formateada
- Botón "Copiar al portapapeles" → Tabla como markdown

---

### BN-007: Analytics

#### 3.3.1 Componentes

**1. Flow Chart (Sankey)**
```
Ingresos → [Categorías] → Egresos
```
- Anchura del flujo = monto
- Color por categoría

**2. Category Pie Chart**
```
Distribución de gastos por categoría
- Tooltip: Monto + % + Transacciones
```

**3. KPIs**
```
- Cash Runway: días de saldo/gasto diario
- Expense Ratio: egresos/ingresos
- Category Concentration: % del top 3
```

**4. Seasonal Trends**
```
LineChart: Promedio de gasto por mes (últimos 12 meses si aplica)
```

---

## 4. Criterios de Aceptación

### Criterios Generales

| Criterio | Umbral |
|:---|:---|
| **Cobertura de Tests (Backend)** | ≥85% |
| **Cobertura de Tests (Frontend)** | ≥70% |
| **Performance: GET /api/movements** | <500ms (500 rows) |
| **Performance: GET /api/insights** | <1s (3+ meses histórico) |
| **Performance: GET /api/forecast** | <500ms |
| **Categorización: Confianza Promedio** | ≥80% |
| **UI: Lighthouse Score** | ≥90 (Accessibility, Best Practices) |
| **UI: Responsividad** | OK en Desktop + Tablet + Mobile |

### Por Bloque Negra

#### BN-001: Parser + Categorización
- [ ] Importa Excel/CSV sin errores
- [ ] Detecta y deduplica movimientos
- [ ] Motor cascada ≥99% en casos normales
- [ ] 100% de movimientos categorizados (al menos "Sin categorizar")
- [ ] Tests: >85% coverage

#### BN-002: Motor de Insights
- [ ] Detecta ≥10 patrones/período (3+ meses histórico)
- [ ] Confianza ≥0.75 en patrones detectados
- [ ] Filtra ruido (timing, calendario, etc.)
- [ ] Resalta cambios reales en patrones
- [ ] Tests: >85% coverage

#### BN-003: Forecasting
- [ ] Proyecta 3 meses con 3 escenarios
- [ ] Confianza ≥0.70 con 3+ meses histórico
- [ ] Advierte confianza baja si <3 meses
- [ ] Permite ajustes manuales (v1: UI simple)
- [ ] Tests: >85% coverage

#### BN-004: API REST
- [ ] 20+ endpoints documentados en OpenAPI
- [ ] CORS configurado para localhost:7000
- [ ] Validación Pydantic en todos los inputs
- [ ] Error handling 400/404/422/500 consistente
- [ ] Tests: >85% coverage

#### BN-005: Dashboard Base
- [ ] Layout Bento Grid 3 cols responsive
- [ ] 6-9 cards mostrando datos críticos
- [ ] PeriodContext sincroniza período global
- [ ] LoadingStates durante fetch
- [ ] Tests: >70% coverage

#### BN-006: Reportes P&L
- [ ] Tabla jerárquica expandible funciona
- [ ] Cálculos correctos (ingresos - egresos = neto)
- [ ] Exporta PDF sin errores
- [ ] Tests: >70% coverage

#### BN-007: Analytics
- [ ] Flow Chart visualiza flujos correctamente
- [ ] Pie Chart refleja distribución de gastos
- [ ] KPIs calculos precisos
- [ ] Seasonal Trends si hay 12+ meses (sino, off)
- [ ] Tests: >70% coverage

#### BN-008: Integración Frontend
- [ ] Dashboard + Reportes + Analytics interactúan
- [ ] Cambiar período en PeriodContext → todos los charts actualizan
- [ ] Loading states globales visibles
- [ ] Error handling: mensajes amigables al usuario
- [ ] E2E: Happy path funciona end-to-end

---

## 5. Dependencias Técnicas

### BN-001 → BN-004
- BN-001 produce datos categorizados
- BN-004 expone esos datos via API

### BN-002 + BN-003 → BN-004
- BN-002 y BN-003 confían en datos de BN-001
- BN-004 expone insights y forecast via endpoints

### BN-005/006/007 → BN-004
- Frontend consume API de BN-004

### BN-008
- Integra todo: BN-005, BN-006, BN-007 coordinados via PeriodContext

---

## 6. Notas de Implementación

### No-Hardcoding Rule
```python
# ❌ NO
CATEGORIES = ["Ingresos", "Gastos", ...]

# ✅ SÍ
# Leer del endpoint /api/categories o de DB
categories = fetch("/api/categories").json()
```

### Testing First
```bash
# Backend: Pytest
pytest -v --cov=src tests/

# Frontend: Vitest + React Testing Library
npm test -- --run --coverage
```

### Code Review Checklist
- [ ] Type hints en todas las funciones (backend)
- [ ] Pydantic schemas para inputs/outputs (backend)
- [ ] React hooks + Context en lugar de Redux (frontend)
- [ ] CSS Vanilla + variables en lugar de Tailwind (frontend)
- [ ] Tests escritos antes o junto con código
- [ ] No hardcoding (todo configurable)

---

## 7. Roadmap de Validación

### Sprint 4 (Actual)
- [x] VISION.md (tori)
- [x] ARQUITECTURA.md (rosario)
- [ ] SPECS.md (claude) — este documento
- [ ] Implementación BN-001-004 (claude)
- [ ] Implementación BN-005-008 (gemini)

### Sprint 5+
- E2E testing
- Performance optimization
- Production deployment (if applicable)
- User feedback loop

---

*Versión: 1.0*  
*Última actualización: 2026-04-22*  
*Responsable: Claude*  
*Estado: DRAFT → REVIEW (esperando feedback)*
