import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightsPage from './page'
import { apiService } from '@/services/api.service'
import { mockInsightsResponse, mockInsightsEmpty } from '@/test/fixtures'

vi.mock('@/services/api.service', () => ({
  apiService: {
    getInsights: vi.fn(),
    getPatrones: vi.fn(),
    getHormigas: vi.fn(),
    getSalud: vi.fn(),
    getProjections: vi.fn(),
  },
}))

vi.mock('@/components/analytics/ObligationsManager', () => ({
  default: () => <div data-testid="obligations-manager" />,
}))

vi.mock('@/context/PeriodContext', () => ({
  usePeriod: () => ({
    selectedPeriod: '2025-06',
    isLoading: false,
    setSelectedPeriod: vi.fn(),
    availablePeriods: ['2025-06'],
    refreshPeriods: vi.fn(),
  }),
}))

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(apiService.getPatrones).mockResolvedValue([])
    vi.mocked(apiService.getHormigas).mockResolvedValue({
      items: [],
      total_mensual_hormiga: 0,
      recomendacion: 'Sin gastos hormiga detectados.',
    })
    vi.mocked(apiService.getSalud).mockResolvedValue({
      ahorro_tasa: 0.2,
      variabilidad_gastos: 0.1,
      balance_ingresos_gastos: 65000,
      score_general: 82,
      alertas: [],
    })
    vi.mocked(apiService.getProjections).mockResolvedValue({
      mes_actual: '2025-06',
      dia_del_mes: 15,
      gasto_actual: 85000,
      proyeccion_lineal: 170000,
      pendientes_recurrentes: 0,
      proyeccion_total: 170000,
      confianza: 0.8,
      patrones_pendientes: [],
    })
  })

  it('renderiza LoadingImperial mientras la API no resuelve', () => {
    vi.mocked(apiService.getInsights).mockImplementation(() => new Promise(() => {}))
    render(<InsightsPage />)
    expect(screen.getByText('Sincronizando con el Motor Cognitivo...')).toBeInTheDocument()
  })

  it('muestra el feed de hallazgos después de cargar', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    await vi.waitFor(() => {
      expect(apiService.getSalud).toHaveBeenCalledWith('2025-06')
    })
    expect(await screen.findByText(/Feed de Hallazgos/i)).toBeInTheDocument()
  })

  it('muestra el tipo "Anomalía Detectada" para insights type outlier', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText('Anomalía Detectada')).toBeInTheDocument()
  })

  it('muestra el tipo "Patrón Recurrente" para insights type pattern', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText('Patrón Recurrente')).toBeInTheDocument()
  })

  it('muestra el porcentaje de confianza de cada insight', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    // confidence: 0.87 → "87%", 0.92 → "92%"
    expect(await screen.findByText('87%')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('muestra la categoría y el texto del insight en cada card', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText('Entretenimiento')).toBeInTheDocument()
    expect(screen.getByText('Suscripciones Digitales')).toBeInTheDocument()
  })

  it('renderiza EmptyState cuando no hay insights', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsEmpty)
    render(<InsightsPage />)
    expect(
      await screen.findByText(/no ha detectado anomalías puntuales/i),
    ).toBeInTheDocument()
  })
})
