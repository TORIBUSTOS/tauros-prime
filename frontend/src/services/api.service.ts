import {
  MovimientoResponse,
  MovimientoMapped,
  InsightsResponse,
  ForecastResponse,
  PLReportResponse,
  SummaryResponse,
  PaginatedMovementsResponse,
  CascadaRule,
  CascadaRuleCreate,
  CascadaRuleUpdate,
  CategoryStats,
  SubcategoriaStats,
  PatronRecurrenteResponse,
  HormigasResponse,
  HealthFlagsResponse,
  ProjectionsResponse,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export interface GetMovementsParams {
  period?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  tipo?: string;
}

export interface GetMovementsResponse {
  items: MovimientoMapped[];
  total: number;
  totalPages: number;
}

export const apiService = {
  getPeriods: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/periods`);
    if (!response.ok) throw new Error('Error al cargar periodos');
    return await response.json();
  },

  getMovements: async (params: GetMovementsParams = {}): Promise<GetMovementsResponse> => {
    const url = new URL(`${API_BASE_URL}/api/movements`);
    if (params.period) url.searchParams.append('period', params.period);
    if (params.page) url.searchParams.append('page', params.page.toString());
    if (params.pageSize) url.searchParams.append('page_size', params.pageSize.toString());
    if (params.search) url.searchParams.append('search', params.search);
    if (params.tipo && params.tipo !== 'all') url.searchParams.append('tipo', params.tipo);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar movimientos');
    
    const data: PaginatedMovementsResponse = await response.json();
    
    return {
      items: data.items.map(m => ({
        ...m,
        periodo: m.fecha.substring(0, 7)
      })),
      total: data.total,
      totalPages: data.total_pages
    };
  },

  getInsights: async (period: string): Promise<InsightsResponse> => {
    const url = new URL(`${API_BASE_URL}/api/insights`);
    url.searchParams.append('period', period);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar insights');
    
    return await response.json();
  },

  getForecast: async (desde: string): Promise<ForecastResponse> => {
    const url = new URL(`${API_BASE_URL}/api/forecast`);
    url.searchParams.append('desde', desde);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar proyecciones');
    
    return await response.json();
  },

  importMovements: async (file: File): Promise<{ batch_id: string, movimientos: number, status: string }> => {
    const url = `${API_BASE_URL}/api/import`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al importar movimientos');
    }

    return await response.json();
  },

  getSummary: async (period: string): Promise<SummaryResponse> => {
    const url = new URL(`${API_BASE_URL}/api/summary`);
    url.searchParams.append('period', period);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar resumen');
    
    return await response.json();
  },

  getReportPL: async (period: string): Promise<PLReportResponse> => {
    const url = new URL(`${API_BASE_URL}/api/reports/pl`);
    url.searchParams.append('period', period);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar reporte P&L');
    return await response.json();
  },

  // == Categorías y Reglas ==================================================

  getCategories: async (period?: string): Promise<CategoryStats[]> => {
    const url = new URL(`${API_BASE_URL}/api/categories`);
    if (period) url.searchParams.append('period', period);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar categorías');
    return await response.json();
  },

  getRules: async (): Promise<CascadaRule[]> => {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    if (!response.ok) throw new Error('Error al cargar reglas');
    return await response.json();
  },

  createRule: async (body: CascadaRuleCreate): Promise<CascadaRule> => {
    const response = await fetch(`${API_BASE_URL}/api/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Error al crear regla');
    }
    return await response.json();
  },

  updateRule: async (id: number, body: CascadaRuleUpdate): Promise<CascadaRule> => {
    const response = await fetch(`${API_BASE_URL}/api/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Error al actualizar regla');
    return await response.json();
  },

  deleteRule: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/rules/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar regla');
  },

  recategorizeAll: async (): Promise<{ total: number; recategorizados: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/recategorize`, { method: 'POST' });
    if (!response.ok) throw new Error('Error al recategorizar');
    return await response.json();
  },

  patchMovimientoCategoria: async (id: number, categoria: string, subcategoria?: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/movements/${id}/categoria`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria, subcategoria }),
    });
    if (!response.ok) throw new Error('Error al reasignar categoría');
  },

  getSubcategoriaStats: async (categoria: string): Promise<SubcategoriaStats[]> => {
    const encoded = encodeURIComponent(categoria);
    const response = await fetch(`${API_BASE_URL}/api/categories/${encoded}/subcategorias`);
    if (!response.ok) throw new Error('Error al cargar subcategorías');
    return await response.json();
  },

  getPatrones: async (): Promise<PatronRecurrenteResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/insights/patrones`);
    if (!response.ok) throw new Error('Error al cargar patrones recurrentes');
    return await response.json();
  },

  getHormigas: async (): Promise<HormigasResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/insights/hormigas`);
    if (!response.ok) throw new Error('Error al cargar análisis de gastos hormiga');
    return await response.json();
  },

  getSalud: async (): Promise<HealthFlagsResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/insights/salud`);
    if (!response.ok) throw new Error('Error al cargar indicadores de salud');
    return await response.json();
  },

  getProjections: async (): Promise<ProjectionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/insights/projections`);
    if (!response.ok) throw new Error('Error al cargar proyecciones de gasto');
    return await response.json();
  },
};
