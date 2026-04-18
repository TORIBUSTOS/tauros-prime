import type {
  MovimientoMapped,
  InsightsResponse,
  ForecastResponse,
  SummaryResponse,
  PLReportResponse,
  CategoryStats,
  CascadaRule,
} from '@/types/api'

// ── Movimientos ──────────────────────────────────────────────────────────────

export const mockMovimientos: MovimientoMapped[] = [
  {
    id: 1,
    fecha: '2025-06-15',
    descripcion: 'Sueldo Empresa ABC',
    monto: 150000,
    categoria: 'Ingresos',
    subcategoria: null,
    tipo: 'ingreso',
    confianza: 0.95,
    periodo: '2025-06',
  },
  {
    id: 2,
    fecha: '2025-06-10',
    descripcion: 'Supermercado Dia',
    monto: -8500,
    categoria: 'Alimentación',
    subcategoria: 'Supermercado',
    tipo: 'egreso',
    confianza: 0.88,
    periodo: '2025-06',
  },
  {
    id: 3,
    fecha: '2025-06-05',
    descripcion: 'Netflix',
    monto: -1800,
    categoria: 'Suscripciones Digitales',
    subcategoria: null,
    tipo: 'egreso',
    confianza: 0.98,
    periodo: '2025-06',
  },
]

// 26 movimientos para testear paginación (PAGE_SIZE = 25)
export const mockMovimientos26: MovimientoMapped[] = Array.from({ length: 26 }, (_, i) => ({
  id: i + 1,
  fecha: '2025-06-15',
  descripcion: `Movimiento ${i + 1}`,
  monto: i % 2 === 0 ? 1000 * (i + 1) : -500 * (i + 1),
  categoria: i % 2 === 0 ? 'Ingresos' : 'Gastos',
  subcategoria: null,
  tipo: i % 2 === 0 ? 'ingreso' : 'egreso',
  confianza: 0.9,
  periodo: '2025-06',
}))

// ── Summary ──────────────────────────────────────────────────────────────────

export const mockSummary: SummaryResponse = {
  period: '2025-06',
  ingresos_total: 150000,
  egresos_total: 85000,
  balance: 65000,
  transaction_count: 35,
}

// ── Insights ─────────────────────────────────────────────────────────────────

export const mockInsightsResponse: InsightsResponse = {
  period: '2025-06',
  insights: [
    {
      type: 'anomaly',
      categoria: 'Entretenimiento',
      insight: 'Gasto 40% superior al promedio histórico de los últimos 3 meses.',
      confidence: 0.87,
      data: {},
    },
    {
      type: 'saving_opportunity',
      categoria: 'Suscripciones Digitales',
      insight: 'Se detectaron suscripciones duplicadas que podrían optimizarse.',
      confidence: 0.92,
      data: {},
    },
  ],
}

export const mockInsightsEmpty: InsightsResponse = {
  period: '2025-06',
  insights: [],
}

// ── P&L Report ───────────────────────────────────────────────────────────────

export const mockPLReport: PLReportResponse = {
  period: '2025-06',
  ingresos_total: 150000,
  egresos_total: 85000,
  resultado_neto: 65000,
  nodos: [
    {
      nombre: 'INGRESOS',
      total: 150000,
      tipo: 'tipo',
      hijos: [],
      movimientos: [],
    },
    {
      nombre: 'EGRESOS',
      total: 85000,
      tipo: 'tipo',
      hijos: [],
      movimientos: [],
    },
  ],
}

export const mockPLReportNegative: PLReportResponse = {
  ...mockPLReport,
  resultado_neto: -10000,
}

// ── Forecast ─────────────────────────────────────────────────────────────────

export const mockForecast: ForecastResponse = {
  period: '2025-06',
  forecast: [
    {
      period: '2025-07',
      forecast: [
        {
          categoria: 'Ingresos',
          expected_count: 5,
          expected_total: 140000,
          expected_avg: 28000,
          confidence: 0.85,
        },
      ],
    },
    {
      period: '2025-08',
      forecast: [
        {
          categoria: 'Ingresos',
          expected_count: 5,
          expected_total: 145000,
          expected_avg: 29000,
          confidence: 0.82,
        },
      ],
    },
    {
      period: '2025-09',
      forecast: [
        {
          categoria: 'Ingresos',
          expected_count: 5,
          expected_total: 148000,
          expected_avg: 29600,
          confidence: 0.79,
        },
      ],
    },
  ],
  scenarios: {
    realistic: { total_3m: 433000 },
    optimistic: { total_3m: 480000 },
    pessimistic: { total_3m: 390000 },
  },
}

// ── Categorías ───────────────────────────────────────────────────────────────

export const mockCategories: CategoryStats[] = [
  {
    categoria: 'Ingresos',
    n_movimientos: 10,
    gasto: 0,
    ingreso: 150000,
    pct_movimientos: 28.6,
    pct_gasto: 0,
    n_reglas: 3,
    subcategorias: ['Sueldo', 'Freelance'],
  },
  {
    categoria: 'Alimentación',
    n_movimientos: 15,
    gasto: 42000,
    ingreso: 0,
    pct_movimientos: 42.9,
    pct_gasto: 49.4,
    n_reglas: 5,
    subcategorias: ['Supermercado', 'Delivery'],
  },
  {
    categoria: 'Suscripciones Digitales',
    n_movimientos: 10,
    gasto: 43000,
    ingreso: 0,
    pct_movimientos: 28.6,
    pct_gasto: 50.6,
    n_reglas: 4,
    subcategorias: [],
  },
]

// ── Reglas Cascada ───────────────────────────────────────────────────────────

export const mockRules: CascadaRule[] = [
  {
    id: 1,
    patron: 'sueldo',
    categoria: 'Ingresos',
    subcategoria: 'Sueldo',
    peso: 0.9,
    veces_usada: 12,
    activo: 1,
  },
  {
    id: 2,
    patron: 'supermercado',
    categoria: 'Alimentación',
    subcategoria: 'Supermercado',
    peso: 0.85,
    veces_usada: 20,
    activo: 1,
  },
  {
    id: 3,
    patron: 'netflix',
    categoria: 'Suscripciones Digitales',
    subcategoria: null,
    peso: 0.95,
    veces_usada: 8,
    activo: 0, // inactiva
  },
]
