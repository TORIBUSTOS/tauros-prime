from pydantic import BaseModel, Field
from datetime import date
from typing import List, Dict, Any

class MovimientoResponse(BaseModel):
    id: int
    fecha: date
    descripcion: str
    monto: float
    categoria: str
    subcategoria: str | None = None
    tipo: str
    confianza: float
    class Config:
        from_attributes = True

class PaginatedMovementsResponse(BaseModel):
    items: List[MovimientoResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class ImportResponse(BaseModel):
    batch_id: int
    movimientos: int
    status: str

class InsightResponse(BaseModel):
    type: str
    categoria: str
    insight: str
    confidence: float
    data: Dict[str, Any]

class InsightsResponse(BaseModel):
    period: str
    insights: List[InsightResponse]

class HormigaItem(BaseModel):
    categoria: str
    monto_promedio: float
    frecuencia_mensual: float
    impacto_anual_estimado: float

class HormigasResponse(BaseModel):
    items: List[HormigaItem]
    total_mensual_hormiga: float
    recomendacion: str

class HealthFlagsResponse(BaseModel):
    ahorro_tasa: float
    variabilidad_gastos: float
    balance_ingresos_gastos: float
    score_general: float
    alertas: List[str]

class PatronRecurrenteResponse(BaseModel):
    id: int
    concepto: str
    frecuencia: str
    monto_promedio: float
    dia_mes: int | None = None
    ultimo_movimiento: date | None = None
    proxima_estimada: date | None = None
    confianza: float

class ForecastItemResponse(BaseModel):
    categoria: str
    expected_count: int
    expected_total: float
    expected_avg: float
    confidence: float

class ForecastMonthResponse(BaseModel):
    period: str
    forecast: List[ForecastItemResponse]

class ForecastResponse(BaseModel):
    period: str
    forecast: List[ForecastMonthResponse]
    scenarios: Dict[str, Any]

class ReportNode(BaseModel):
    nombre: str
    total: float
    tipo: str # 'tipo' | 'categoria' | 'subcategoria'
    variacion: float | None = None
    hijos: List['ReportNode'] = []
    movimientos: List[MovimientoResponse] = []

class PLReportResponse(BaseModel):
    period: str
    ingresos_total: float
    egresos_total: float
    resultado_neto: float
    nodos: List[ReportNode] # Ingresos y Egresos como nodos raíz

class SuggestionsResponse(BaseModel):
    suggestions: list

class SummaryResponse(BaseModel):
    period: str
    ingresos_total: float
    egresos_total: float
    balance: float
    equity: float
    transaction_count: int

# ── Categorías y Reglas ────────────────────────────────────────────────────

class CascadaRuleResponse(BaseModel):
    id: int
    categoria: str
    subcategoria: str | None = None
    patron: str
    peso: float
    veces_usada: int
    activo: int
    class Config:
        from_attributes = True

class CascadaRuleCreate(BaseModel):
    patron: str
    categoria: str
    subcategoria: str | None = None
    peso: float = 0.85

class CascadaRuleUpdate(BaseModel):
    patron: str | None = None
    categoria: str | None = None
    subcategoria: str | None = None
    peso: float | None = None
    activo: int | None = None

class CategoryStatsResponse(BaseModel):
    categoria: str
    n_movimientos: int
    gasto: float
    ingreso: float
    pct_movimientos: float
    pct_gasto: float
    n_reglas: int
    subcategorias: List[str]

class RecategorizeResponse(BaseModel):
    total: int
    recategorizados: int

class SubcategoriaStatsResponse(BaseModel):
    subcategoria: str
    n_movimientos: int
    gasto: float
    ingreso: float
    pct_gasto: float    # % del gasto total de la categoría padre
    pct_movimientos: float  # % de movimientos de la categoría padre

