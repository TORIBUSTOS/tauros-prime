import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from './page'
import { apiService } from '@/services/api.service'
import { mockMovimientos, mockPLReport, mockForecast } from '@/test/fixtures'

// == Mocks de servicio ========================================================

vi.mock('@/services/api.service', () => ({
  apiService: {
    getMovements: vi.fn(),
    getReportPL: vi.fn(),
    getForecast: vi.fn(),
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

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: 'finance-first',
    isFtStyle: true,
    setTheme: vi.fn(),
  }),
}))

// == Stubs de componentes de charts ===========================================

vi.mock('@/components/analytics/FlowChart', () => ({
  default: () => <div data-testid="flow-chart" />,
}))

vi.mock('@/components/analytics/CategoryPieChart', () => ({
  default: () => <div data-testid="pie-chart" />,
}))

vi.mock('@/components/analytics/ForecastChart', () => ({
  default: () => <div data-testid="forecast-chart" />,
}))

vi.mock('@/components/analytics/HormigaAnalysis', () => ({
  default: () => <div data-testid="hormiga-analysis" />,
}))

// == Helpers ==================================================================

function setupSuccessfulAPIs() {
  vi.mocked(apiService.getMovements).mockResolvedValue(mockMovimientos)
  vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
  vi.mocked(apiService.getForecast).mockResolvedValue(mockForecast)
}

// == Tests =====================================================================

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza estado de carga "Procesando Inteligencia"', () => {
    vi.mocked(apiService.getMovements).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getReportPL).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getForecast).mockImplementation(() => new Promise(() => {}))
    render(<AnalyticsPage />)
    expect(screen.getByText('Procesando Inteligencia')).toBeInTheDocument()
  })

  it('renderiza FlowChart después de cargar con movimientos', async () => {
    setupSuccessfulAPIs()
    render(<AnalyticsPage />)
    expect(await screen.findByTestId('flow-chart')).toBeInTheDocument()
  })

  it('renderiza CategoryPieChart cuando hay datos de reporte', async () => {
    setupSuccessfulAPIs()
    render(<AnalyticsPage />)
    expect(await screen.findByTestId('pie-chart')).toBeInTheDocument()
  })

  it('renderiza ForecastChart cuando hay datos de forecast', async () => {
    setupSuccessfulAPIs()
    render(<AnalyticsPage />)
    expect(await screen.findByTestId('forecast-chart')).toBeInTheDocument()
  })

  it('muestra "Sin datos para visualizar" cuando no hay movimientos', async () => {
    vi.mocked(apiService.getMovements).mockResolvedValue([])
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
    vi.mocked(apiService.getForecast).mockResolvedValue(mockForecast)
    render(<AnalyticsPage />)
    expect(await screen.findByText('Sin datos para visualizar')).toBeInTheDocument()
  })

  it('muestra "Score Imperial" en el health card', async () => {
    setupSuccessfulAPIs()
    render(<AnalyticsPage />)
    expect(await screen.findByText(/Score Imperial/i)).toBeInTheDocument()
  })

  it('muestra el porcentaje de precisión AI basado en la confianza promedio', async () => {
    setupSuccessfulAPIs()
    render(<AnalyticsPage />)
    // mockMovimientos tiene confianza 0.95, 0.88, 0.98 → promedio ≈ 93.7%
    expect(await screen.findByText(/93\.7% Precisión AI/i)).toBeInTheDocument()
  })
})
