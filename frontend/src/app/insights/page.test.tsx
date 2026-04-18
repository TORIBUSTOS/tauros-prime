import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightsPage from './page'
import { apiService } from '@/services/api.service'
import { mockInsightsResponse, mockInsightsEmpty } from '@/test/fixtures'

vi.mock('@/services/api.service', () => ({
  apiService: {
    getInsights: vi.fn(),
  },
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
  })

  it('renderiza LoadingImperial mientras la API no resuelve', () => {
    vi.mocked(apiService.getInsights).mockImplementation(() => new Promise(() => {}))
    render(<InsightsPage />)
    expect(screen.getByText('Sincronizando con el Motor Cognitivo...')).toBeInTheDocument()
  })

  it('muestra el conteo de hallazgos después de cargar', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText(/2 hallazgos/i)).toBeInTheDocument()
  })

  it('muestra el tipo "Anomalía Detectada" para insights type anomaly', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText('Anomalía Detectada')).toBeInTheDocument()
  })

  it('muestra el tipo "Oportunidad de Ahorro" para insights type saving_opportunity', async () => {
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    render(<InsightsPage />)
    expect(await screen.findByText('Oportunidad de Ahorro')).toBeInTheDocument()
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
      await screen.findByText(/no ha detectado patrones significativos/i),
    ).toBeInTheDocument()
  })
})
