export interface SummaryResponse {
  period: string;
  ingresos_total: number;
  egresos_total: number;
  balance: number;
  transaction_count: number;
}

export interface MovimientoMapped extends MovimientoResponse {
  periodo: string;
}

export interface MovimientoResponse {
  id: number;
  fecha: string; // ISO date string from API
  descripcion: string;
  monto: number;
  categoria: string;
  subcategoria: string | null;
  tipo: string;
  confianza: number;
}

export interface InsightItem {
  type: string;
  categoria: string;
  insight: string;
  confidence: number;
  data: Record<string, any>;
}

export interface InsightsResponse {
  period: string;
  insights: InsightItem[];
}

export interface ForecastItem {
  categoria: string;
  expected_count: number;
  expected_total: number;
  expected_avg: number;
  confidence: number;
}

export interface ForecastMonth {
  period: string;
  forecast: ForecastItem[];
}

export interface ForecastResponse {
  period: string;
  forecast: ForecastMonth[];
  scenarios: Record<string, any>;
}

export interface PLReportResponse {
  period: string;
  ingresos_total: number;
  egresos_total: number;
  resultado_neto: number;
  nodos: ReportNode[];
}

export interface ReportNode {
  nombre: string;
  total: number;
  tipo: 'tipo' | 'categoria' | 'subcategoria';
  variacion?: number;
  hijos: ReportNode[];
  movimientos: MovimientoResponse[];
}

// ── Categorías y Reglas ────────────────────────────────────────────────────

export interface CascadaRule {
  id: number;
  categoria: string;
  subcategoria: string | null;
  patron: string;
  peso: number;
  veces_usada: number;
  activo: number;
}

export interface CascadaRuleCreate {
  patron: string;
  categoria: string;
  subcategoria?: string;
  peso?: number;
}

export interface CascadaRuleUpdate {
  patron?: string;
  categoria?: string;
  subcategoria?: string;
  peso?: number;
  activo?: number;
}

export interface CategoryStats {
  categoria: string;
  n_movimientos: number;
  gasto: number;
  ingreso: number;
  pct_movimientos: number;
  pct_gasto: number;
  n_reglas: number;
  subcategorias: string[];
}

export interface SubcategoriaStats {
  subcategoria: string;
  n_movimientos: number;
  gasto: number;
  ingreso: number;
  pct_gasto: number;
  pct_movimientos: number;
}
