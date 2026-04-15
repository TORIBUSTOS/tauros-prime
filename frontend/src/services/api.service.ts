import {
  MovimientoResponse,
  MovimientoMapped,
  InsightsResponse,
  ForecastResponse,
  PLReportResponse,
  SummaryResponse,
  CascadaRule,
  CascadaRuleCreate,
  CascadaRuleUpdate,
  CategoryStats,
  SubcategoriaStats,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export const apiService = {
  getPeriods: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/periods`);
    if (!response.ok) throw new Error('Error al cargar periodos');
    return await response.json();
  },

  getMovements: async (period?: string): Promise<MovimientoMapped[]> => {
    const url = new URL(`${API_BASE_URL}/api/movements`);
    if (period) url.searchParams.append('period', period);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar movimientos');
    
    const data: MovimientoResponse[] = await response.json();
    
    // Mapeo mínimo: el backend ya provee categoria, subcategoria y tipo
    return data.map(m => ({
      ...m,
      periodo: m.fecha.substring(0, 7)
    }));
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

  // ── Categorías y Reglas ──────────────────────────────────────────────────

  getCategories: async (): Promise<CategoryStats[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
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
};
