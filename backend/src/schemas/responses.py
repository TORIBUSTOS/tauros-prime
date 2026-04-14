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
    transaction_count: int

