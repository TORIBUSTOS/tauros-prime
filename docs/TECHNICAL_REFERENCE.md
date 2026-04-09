# Technical Reference — TORO_Prime

Para developers y architects.

---

## Database Schema

### movimientos
```sql
CREATE TABLE movimientos (
  id INTEGER PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  monto FLOAT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  tipo VARCHAR(50) NOT NULL DEFAULT 'egreso',  -- ingreso | egreso
  confianza FLOAT DEFAULT 0.0,  -- 0.0-1.0
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_categoria ON movimientos(categoria);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
```

### import_batches
```sql
CREATE TABLE import_batches (
  id INTEGER PRIMARY KEY,
  nombre_archivo VARCHAR(255) NOT NULL,
  cantidad_movimientos INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### cascada_rules
```sql
CREATE TABLE cascada_rules (
  id INTEGER PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  patron VARCHAR(255) UNIQUE NOT NULL,  -- Searchable pattern
  peso FLOAT DEFAULT 0.5,  -- Confidence multiplier
  veces_usada INTEGER DEFAULT 1,  -- Learning counter
  activo INTEGER DEFAULT 1  -- Boolean flag
);

CREATE INDEX idx_cascada_rules_patron ON cascada_rules(patron);
```

---

## Pydantic Models

### MovimientoResponse
```python
class MovimientoResponse(BaseModel):
    id: int
    fecha: date
    descripcion: str
    monto: float
    categoria: str
    subcategoria: Optional[str] = None
    tipo: str  # "ingreso" | "egreso"
    confianza: float
    created_at: datetime
```

### InsightResponse
```python
class InsightResponse(BaseModel):
    type: str  # "pattern" | "outlier" | "context_anomaly"
    confidence: float  # 0.5-0.95
    titulo: str
    descripcion: str
    categoria: Optional[str] = None
    monto: Optional[float] = None
    fecha: Optional[date] = None
```

### ForecastMonth
```python
class ForecastMonth(BaseModel):
    mes: str  # "YYYY-MM"
    expected_total: float
    confidence: float
    breakdown: dict  # {"ingresos": X, "egresos": Y}
```

### ForecastResponse
```python
class ForecastResponse(BaseModel):
    periodo_base: str
    forecast: List[ForecastMonth]
    scenarios: dict  # {optimistic, realistic, pessimistic}
```

---

## Services API

### ParserService

```python
class ParserService:
    REQUIRED_COLUMNS = ['fecha', 'descripcion', 'monto']
    
    @staticmethod
    def parse_excel(file_bytes: bytes, filename: str, db: Session) -> ImportBatch:
        """
        Parsea Excel, valida duplicados (hash-based), inserta a BD.
        Retorna ImportBatch con cantidad de movimientos nuevos.
        """
        
    @staticmethod
    def _generate_hash(fecha: str, descripcion: str, monto: float) -> str:
        """MD5 hash para detectar duplicados."""
```

**Key Features**:
- Validación de columnas requeridas
- Deduplicación por hash (fecha|descripcion|monto)
- Asignación automática de `tipo` (ingreso si monto > 0)
- Transacción atómica (commit/rollback)

---

### CategorizerService

```python
class CategorizerService:
    
    @staticmethod
    def categorize(movimiento: Movimiento, db: Session) -> str:
        """
        Busca CascadaRules que matcheen con descripción.
        Retorna mejor match por peso.
        """
        
    @staticmethod
    def save_rule(descripcion: str, categoria: str, peso: float, db: Session) -> CascadaRule:
        """
        Crea o actualiza rule si ya existe (por patrón).
        Incrementa veces_usada si reutilizado.
        """
```

**Algorithm**:
1. Extrae palabras de `movimiento.descripcion`
2. Busca CascadaRules con `patron` en las palabras
3. Ordena por `peso`
4. Retorna mejor match o "Sin categorizar"

---

### InsightsService

```python
class InsightsService:
    
    @staticmethod
    def generate_insights(period: str, db: Session) -> List[InsightResponse]:
        """
        Analiza movimientos del período.
        Retorna lista de insights: patrones, outliers, anomalías.
        """
```

**Detection Types**:

| Tipo | Algoritmo | Ejemplo |
|------|-----------|---------|
| **Pattern** | Recurrencias (misma descripción, diferencia <5% monto) | Pago OSPACA el 5 de cada mes |
| **Outlier** | Desviación estándar > 2σ | Gasto $5,000 vs promedio $500 |
| **Context Anomaly** | Outlier + contexto (timing, deuda anterior) | OSPACA 2x porque pagó mes anterior |

---

### ForecastService

```python
class ForecastService:
    
    @staticmethod
    def forecast_3months(desde: str, db: Session) -> dict:
        """
        Proyecta 3 meses desde 'desde'.
        Retorna forecast + 3 escenarios.
        """
```

**Algorithm**:
1. Suma movimientos por categoría + mes
2. Calcula promedio histórico
3. Genera 3 escenarios:
   - Optimistic: +20%
   - Realistic: promedio
   - Pessimistic: -30%

---

### ReportService

```python
class ReportService:
    
    @staticmethod
    def get_pl_report(period: str, db: Session) -> dict:
        """
        Genera reporte P&L jerárquico.
        Estructura: {ingresos: {...}, egresos: {...}}
        """
```

**Output Structure**:
```python
{
    "periodo": "2025-06",
    "ingresos_total": 45000.0,
    "egresos_total": 28000.0,
    "resultado_neto": 17000.0,
    "nodos": [
        {
            "nombre": "INGRESOS",
            "total": 45000.0,
            "variacion": 5.2,  # % change vs prev month
            "hijos": [
                {
                    "nombre": "Suscripciones",
                    "total": 18000.0,
                    "variacion": 10.5,
                    "hijos": [...]
                }
            ]
        }
    ]
}
```

---

## Frontend Architecture

### Context API

#### PeriodContext
```typescript
interface PeriodContextType {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  availablePeriods: string[];
  isLoading: boolean;
  refreshPeriods: () => Promise<void>;
}
```

**Usage**:
```typescript
const { selectedPeriod, setSelectedPeriod } = usePeriod();
// Cuando cambia selectedPeriod, toda la app se sincroniza
```

#### ToastContext
```typescript
interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';
```

**Usage**:
```typescript
const { showToast } = useToast();
showToast("Éxito al importar", "success");
```

---

## API Service

### apiService

```typescript
export const apiService = {
  getPeriods: async (): Promise<string[]>
  getMovements: async (period?: string): Promise<MovimientoMapped[]>
  getInsights: async (period: string): Promise<InsightsResponse>
  getForecast: async (desde: string): Promise<ForecastResponse>
  getSummary: async (period: string): Promise<SummaryResponse>
  getReportPL: async (period: string): Promise<PLReportResponse>
  importMovements: async (file: File): Promise<ImportResponse>
}
```

All methods throw on non-200 status.

---

## Type Definitions

### Frontend Types

```typescript
// api.ts
interface MovimientoResponse {
  id: number;
  fecha: string;  // ISO date
  descripcion: string;
  monto: number;
  categoria: string;
  subcategoria: string | null;
  tipo: 'ingreso' | 'egreso';
  confianza: number;
  created_at: string;
}

interface MovimientoMapped extends MovimientoResponse {
  periodo: string;  // YYYY-MM
}

interface InsightsResponse {
  period: string;
  insights: Array<{
    type: 'pattern' | 'outlier' | 'context_anomaly';
    confidence: number;
    titulo: string;
    descripcion: string;
    categoria?: string;
    monto?: number;
    fecha?: string;
  }>;
}

interface ForecastResponse {
  periodo_base: string;
  forecast: Array<{
    mes: string;
    expected_total: number;
    confidence: number;
    breakdown: { ingresos: number; egresos: number };
  }>;
  scenarios: {
    optimistic: { total_3m: number };
    realistic: { total_3m: number };
    pessimistic: { total_3m: number };
  };
}

interface SummaryResponse {
  period: string;
  ingresos_total: number;
  egresos_total: number;
  balance: number;
  transaction_count: number;
}

interface PLReportResponse {
  periodo: string;
  ingresos_total: number;
  egresos_total: number;
  resultado_neto: number;
  nodos: ReportNode[];
}

interface ReportNode {
  nombre: string;
  total: number;
  variacion?: number;
  hijos: ReportNode[];
  movimientos?: MovimientoResponse[];
}
```

---

## Configuration

### Backend (src/core/config.py)

```python
class Settings:
    DATABASE_URL: str = "sqlite:///toro_prime.db"
    DEBUG: bool = False
    API_TITLE: str = "TORO_Prime API"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_APP_TITLE=TAUROS - Bóveda Prime
```

---

## Testing

### Backend Tests

```bash
pytest tests/test_bn001.py -v          # Parser + Categorizer
pytest tests/test_bn002.py -v          # Insights
pytest tests/test_bn003.py -v          # Forecast
pytest tests/test_bn004.py -v          # API
pytest -v --cov=src --cov-report=html  # Coverage
```

### Frontend Tests

```bash
npm run test                    # Vitest
npm run test:coverage          # Coverage report
```

---

## Database Migrations

### Using Alembic

```bash
# Generate migration (auto-detect schema changes)
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Current migration version
alembic current
```

### Manual Migration (SQLite)

```bash
sqlite3 toro_prime.db "ALTER TABLE movimientos ADD COLUMN new_col TEXT;"
```

---

## Performance Tuning

### Database Indexes
```sql
-- Already present:
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_categoria ON movimientos(categoria);

-- To add:
CREATE INDEX idx_movimientos_periodo ON movimientos(strftime('%Y-%m', fecha));
```

### API Query Limits
- `/movements`: Max 500 per request
- Rationale: Balance between data freshness and speed

### Frontend Caching
- PeriodContext caches periods (refreshed on import)
- API calls use fetch (browser cache enabled)

---

## Deployment Checklist

- [ ] Database migrations applied (`alembic upgrade head`)
- [ ] Backend tests passing (`pytest -v`)
- [ ] Frontend tests passing (`npm run test`)
- [ ] Environment variables set (`.env.local`)
- [ ] No console errors or warnings
- [ ] Lighthouse score > 85
- [ ] CORS configured for production domain
- [ ] Rate limiting configured (if needed)

---

*Reference Actualizada: 2026-04-09*  
*Para contribuidores y futuros desarrolladores*
