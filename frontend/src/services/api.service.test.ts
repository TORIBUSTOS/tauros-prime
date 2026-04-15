import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiService } from './api.service'

// Mock fetch
global.fetch = vi.fn()

const API_URL = 'http://localhost:9000'

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = API_URL
  })

  describe('getPeriods', () => {
    it('should fetch periods successfully', async () => {
      const mockPeriods = ['2025-06', '2025-07', '2025-08']
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      })

      const result = await apiService.getPeriods()

      expect(result).toEqual(mockPeriods)
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/api/reports/periods`
      )
    })

    it('should throw error on failed period fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getPeriods()).rejects.toThrow(
        'Error al cargar periodos'
      )
    })
  })

  describe('getMovements', () => {
    it('should fetch all movements without period', async () => {
      const mockMovements = [
        {
          id: 1,
          fecha: '2025-06-01',
          descripcion: 'Test',
          monto: 1000,
          categoria: 'Ingresos',
          subcategoria: null,
          tipo: 'ingreso',
          confianza: 0.9,
          created_at: '2025-06-01T00:00:00',
        },
      ]
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovements,
      })

      const result = await apiService.getMovements()

      expect(result).toHaveLength(1)
      expect(result[0].periodo).toBe('2025-06')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/movements')
      )
    })

    it('should fetch movements filtered by period', async () => {
      const mockMovements = [
        {
          id: 1,
          fecha: '2025-06-01',
          descripcion: 'Test',
          monto: 1000,
          categoria: 'Ingresos',
          subcategoria: null,
          tipo: 'ingreso',
          confianza: 0.9,
          created_at: '2025-06-01T00:00:00',
        },
      ]
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovements,
      })

      await apiService.getMovements('2025-06')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=2025-06')
      )
    })

    it('should throw error on failed movement fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getMovements()).rejects.toThrow(
        'Error al cargar movimientos'
      )
    })
  })

  describe('getInsights', () => {
    it('should fetch insights for period', async () => {
      const mockInsights = {
        period: '2025-06',
        insights: [
          {
            type: 'pattern',
            confidence: 0.85,
            titulo: 'Test',
            descripcion: 'Test insight',
          },
        ],
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInsights,
      })

      const result = await apiService.getInsights('2025-06')

      expect(result.period).toBe('2025-06')
      expect(result.insights).toHaveLength(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=2025-06')
      )
    })

    it('should throw error on failed insights fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getInsights('2025-06')).rejects.toThrow(
        'Error al cargar insights'
      )
    })
  })

  describe('getForecast', () => {
    it('should fetch forecast for desde period', async () => {
      const mockForecast = {
        periodo_base: '2025-06',
        forecast: [
          {
            mes: '2025-07',
            expected_total: 5000,
            confidence: 0.8,
            breakdown: { ingresos: 6000, egresos: 1000 },
          },
        ],
        scenarios: {
          optimistic: { total_3m: 18000 },
          realistic: { total_3m: 15000 },
          pessimistic: { total_3m: 10500 },
        },
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecast,
      })

      const result = await apiService.getForecast('2025-06')

      expect(result.forecast).toHaveLength(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('desde=2025-06')
      )
    })

    it('should throw error on failed forecast fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getForecast('2025-06')).rejects.toThrow(
        'Error al cargar proyecciones'
      )
    })
  })

  describe('getSummary', () => {
    it('should fetch summary for period', async () => {
      const mockSummary = {
        period: '2025-06',
        ingresos_total: 10000,
        egresos_total: 5000,
        balance: 5000,
        transaction_count: 10,
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary,
      })

      const result = await apiService.getSummary('2025-06')

      expect(result.balance).toBe(5000)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=2025-06')
      )
    })

    it('should throw error on failed summary fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getSummary('2025-06')).rejects.toThrow(
        'Error al cargar resumen'
      )
    })
  })

  describe('getReportPL', () => {
    it('should fetch P&L report for period', async () => {
      const mockReport = {
        period: '2025-06',
        ingresos_total: 10000,
        egresos_total: 5000,
        resultado_neto: 5000,
        nodos: [],
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReport,
      })

      const result = await apiService.getReportPL('2025-06')

      expect(result.resultado_neto).toBe(5000)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=2025-06')
      )
    })

    it('should throw error on failed P&L fetch', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
      })

      await expect(apiService.getReportPL('2025-06')).rejects.toThrow(
        'Error al cargar reporte P&L'
      )
    })
  })

  describe('importMovements', () => {
    it('should import file successfully', async () => {
      const mockFile = new File(['test'], 'test.xlsx')
      const mockResponse = {
        batch_id: '123',
        movimientos: 10,
        status: 'success',
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.importMovements(mockFile)

      expect(result.batch_id).toBe('123')
      expect(result.movimientos).toBe(10)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/import'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should handle import error with detail message', async () => {
      const mockFile = new File(['test'], 'test.xlsx')
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid file format' }),
      })

      await expect(apiService.importMovements(mockFile)).rejects.toThrow(
        'Invalid file format'
      )
    })

    it('should handle import error without detail message', async () => {
      const mockFile = new File(['test'], 'test.xlsx')
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(apiService.importMovements(mockFile)).rejects.toThrow(
        'Error al importar movimientos'
      )
    })
  })
})
