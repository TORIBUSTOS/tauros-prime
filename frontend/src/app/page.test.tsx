import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'
import { apiService } from '@/services/api.service'
import { mockMovimientos, mockInsightsResponse, mockSummary, mockForecast } from '@/test/fixtures'

// == Mocks de servicio ========================================================

vi.mock('@/services/api.service', () => ({
  apiService: {
    getMovements: vi.fn(),
    getInsights: vi.fn(),
    getSummary: vi.fn(),
    getForecast: vi.fn(),
    importMovements: vi.fn(),
  },
}))

// == Mocks de contextos =======================================================

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

const mockShowToast = vi.fn()
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

// == Stubs de componentes pesados =============================================

vi.mock('@/components/analytics/FlowChart', () => ({
  default: () => <div data-testid="flow-chart" />,
}))

vi.mock('@/components/dashboard/TopCategorias', () => ({
  default: () => <div data-testid="top-categorias" />,
}))

vi.mock('@/components/dashboard/CortexHub', () => ({
  default: () => <div data-testid="cortex-hub" />,
}))

vi.mock('@/components/dashboard/FileUploadZone', () => ({
  default: ({ onUpload }: { onUpload: (f: File) => void; isUploading: boolean }) => (
    <button data-testid="file-upload-zone" onClick={() => onUpload(new File([''], 'test.xlsx'))}>
      Upload
    </button>
  ),
}))

// == Helpers ==================================================================

function setupSuccessfulAPIs() {
  vi.mocked(apiService.getMovements).mockResolvedValue(mockMovimientos)
  vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
  vi.mocked(apiService.getSummary).mockResolvedValue(mockSummary)
  vi.mocked(apiService.getForecast).mockResolvedValue(mockForecast)
}

// == Tests =====================================================================

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockShowToast.mockClear()
  })

  it('renderiza estado de carga "Accediendo a la Bóveda" mientras las APIs no resuelven', () => {
    // El componente inicia con loading=true, y fetchData nunca resuelve
    vi.mocked(apiService.getMovements).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getInsights).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getSummary).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getForecast).mockImplementation(() => new Promise(() => {}))
    render(<DashboardPage />)
    expect(screen.getByText('Accediendo a la Bóveda')).toBeInTheDocument()
  })

  it('renderiza el header "Digital Vault" después de cargar', async () => {
    setupSuccessfulAPIs()
    render(<DashboardPage />)
    // "Digital" y "Vault" son text nodes separados en el h1
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/Digital/i)
    expect(heading).toHaveTextContent(/Vault/i)
  })

  it('renderiza MetricCard "Balance Imperial" con el valor del balance', async () => {
    setupSuccessfulAPIs()
    render(<DashboardPage />)
    expect(await screen.findByText('Balance Imperial')).toBeInTheDocument()
  })

  it('renderiza MetricCard "Ingresos Mensuales"', async () => {
    setupSuccessfulAPIs()
    render(<DashboardPage />)
    expect(await screen.findByText('Ingresos Mensuales')).toBeInTheDocument()
  })

  it('renderiza el stub del FlowChart', async () => {
    setupSuccessfulAPIs()
    render(<DashboardPage />)
    expect(await screen.findByTestId('flow-chart')).toBeInTheDocument()
  })

  it('renderiza el stub de CortexHub', async () => {
    setupSuccessfulAPIs()
    render(<DashboardPage />)
    expect(await screen.findByTestId('cortex-hub')).toBeInTheDocument()
  })

  it('muestra toast de error cuando getMovements falla', async () => {
    vi.mocked(apiService.getMovements).mockRejectedValue(new Error('Network error'))
    vi.mocked(apiService.getInsights).mockResolvedValue(mockInsightsResponse)
    vi.mocked(apiService.getSummary).mockResolvedValue(mockSummary)
    vi.mocked(apiService.getForecast).mockResolvedValue(mockForecast)
    render(<DashboardPage />)
    await screen.findByRole('heading', { level: 1 }).catch(() => {})
    // Esperar que el toast de error sea llamado
    await vi.waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        'error',
      )
    })
  })
})
