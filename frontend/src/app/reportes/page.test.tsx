import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportesPage from './page'
import { apiService } from '@/services/api.service'
import { mockPLReport, mockPLReportNegative } from '@/test/fixtures'

vi.mock('@/services/api.service', () => ({
  apiService: {
    getReportPL: vi.fn(),
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

// HierarchicalTable usa Recharts internamente — lo mockeamos como stub
vi.mock('@/components/reports/HierarchicalTable', () => ({
  default: () => <div data-testid="hierarchical-table" />,
}))

describe('ReportesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza LoadingImperial mientras carga', () => {
    vi.mocked(apiService.getReportPL).mockImplementation(() => new Promise(() => {}))
    render(<ReportesPage />)
    expect(screen.getByText('Extrayendo datos de la Bóveda Financiera...')).toBeInTheDocument()
  })

  it('muestra los 3 summary cards al recibir datos', async () => {
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
    render(<ReportesPage />)
    expect(await screen.findByText('Ingresos Totales')).toBeInTheDocument()
    expect(screen.getByText('Egresos Totales')).toBeInTheDocument()
    expect(screen.getByText('Resultado Neto')).toBeInTheDocument()
  })

  it('muestra la clase text-success en resultado_neto positivo', async () => {
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
    render(<ReportesPage />)
    await screen.findByText('Resultado Neto')
    // SummaryCard value span tiene 'tabular-nums' + la clase de color
    // Usamos querySelector para evitar dependencias de formato de número (locale)
    expect(document.querySelector('.tabular-nums.text-success')).not.toBeNull()
  })

  it('muestra la clase text-error en resultado_neto negativo', async () => {
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReportNegative)
    render(<ReportesPage />)
    await screen.findByText('Resultado Neto')
    expect(document.querySelector('.tabular-nums.text-error')).not.toBeNull()
  })

  it('muestra el período activo en el header', async () => {
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
    render(<ReportesPage />)
    // El período aparece en el badge del header
    const periodBadge = await screen.findByText('2025-06')
    expect(periodBadge).toBeInTheDocument()
  })

  it('renderiza HierarchicalTable cuando hay datos', async () => {
    vi.mocked(apiService.getReportPL).mockResolvedValue(mockPLReport)
    render(<ReportesPage />)
    expect(await screen.findByTestId('hierarchical-table')).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando la API falla', async () => {
    vi.mocked(apiService.getReportPL).mockRejectedValue(new Error('Network error'))
    render(<ReportesPage />)
    expect(
      await screen.findByText(/No se pudo cargar el reporte de P&L/i),
    ).toBeInTheDocument()
  })
})
