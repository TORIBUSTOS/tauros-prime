import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovimientosPage from './page'
import { apiService } from '@/services/api.service'
import { mockCategories, mockMovimientos, mockMovimientos26, mockMovementsPage } from '@/test/fixtures'

// == Mocks de next/navigation con searchParams configurable ===================

const mockGetSearchParam = vi.hoisted(() => vi.fn().mockReturnValue(null))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => ({ get: mockGetSearchParam }),
  usePathname: vi.fn().mockReturnValue('/movimientos'),
}))

// == Mocks de servicio y contexto =============================================

vi.mock('@/services/api.service', () => ({
  apiService: {
    getMovements: vi.fn(),
    getCategories: vi.fn(),
    patchMovimientoCategoria: vi.fn(),
    createRuleFromMovement: vi.fn(),
  },
}))

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
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

// == Tests =====================================================================

describe('MovimientosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockGetSearchParam.mockReturnValue(null)
    vi.mocked(apiService.getCategories).mockResolvedValue(mockCategories)
  })

  it('renderiza el loading fallback del Suspense "Preparando Bóveda..."', () => {
    // La API nunca resuelve — el Suspense muestra su fallback
    vi.mocked(apiService.getMovements).mockImplementation(() => new Promise(() => {}))
    render(<MovimientosPage />)
    // Tanto el Suspense fallback como el loading interno pueden aparecer
    // El Suspense muestra "Preparando Bóveda..." mientras el componente suspende
    // Con happy-dom + Vitest, el Suspense fallback o el loading del componente interno
    expect(
      screen.queryByText('Preparando Bóveda...') ||
      screen.queryByText('Recuperando archivos de la Bóveda...'),
    ).not.toBeNull()
  })

  it('renderiza las filas de movimientos después de cargar', async () => {
    vi.mocked(apiService.getMovements).mockResolvedValue(mockMovementsPage(mockMovimientos))
    render(<MovimientosPage />)
    expect((await screen.findAllByText('Sueldo Empresa ABC')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Supermercado Dia').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Netflix').length).toBeGreaterThan(0)
  })

  it('filtra movimientos por término de búsqueda', async () => {
    vi.mocked(apiService.getMovements).mockResolvedValue(mockMovementsPage(mockMovimientos))
    render(<MovimientosPage />)
    // Esperar a que carguen los datos
    await screen.findAllByText('Sueldo Empresa ABC')

    const input = screen.getByPlaceholderText(/Buscar por descripción o categoría/i)
    await userEvent.type(input, 'Supermercado')

    await waitFor(() => {
      expect(apiService.getMovements).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'Supermercado' }),
      )
    })
  })

  it('filtra solo egresos al hacer click en "Egresos"', async () => {
    vi.mocked(apiService.getMovements).mockResolvedValue(mockMovementsPage(mockMovimientos))
    render(<MovimientosPage />)
    await screen.findAllByText('Sueldo Empresa ABC')

    await userEvent.click(screen.getByRole('button', { name: /Egresos/i }))

    await waitFor(() => {
      expect(apiService.getMovements).toHaveBeenLastCalledWith(
        expect.objectContaining({ tipo: 'egreso' }),
      )
    })
  })

  it('muestra EmptyState cuando no hay resultados que coincidan con la búsqueda', async () => {
    vi.mocked(apiService.getMovements)
      .mockResolvedValueOnce(mockMovementsPage(mockMovimientos))
      .mockResolvedValue(mockMovementsPage([]))
    render(<MovimientosPage />)
    await screen.findAllByText('Sueldo Empresa ABC')

    const input = screen.getByPlaceholderText(/Buscar por descripción o categoría/i)
    await userEvent.type(input, 'ZZZ_INEXISTENTE')

    expect((await screen.findAllByText(/No se encontraron registros/i)).length).toBeGreaterThan(0)
  })

  it('pre-llena el filtro de tipo cuando el URL param "tipo=egreso" está presente', async () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === 'tipo' ? 'egreso' : null,
    )
    vi.mocked(apiService.getMovements).mockResolvedValue(
      mockMovementsPage(mockMovimientos.filter(m => m.tipo === 'egreso')),
    )
    render(<MovimientosPage />)
    await screen.findAllByText('Supermercado Dia')

    // Con tipo=egreso, el ingreso no debería estar visible
    expect(screen.queryByText('Sueldo Empresa ABC')).not.toBeInTheDocument()
    expect(screen.getAllByText('Supermercado Dia').length).toBeGreaterThan(0)
  })

  it('muestra paginación y solo 25 registros al tener 26 movimientos', async () => {
    vi.mocked(apiService.getMovements).mockResolvedValue(mockMovementsPage(mockMovimientos26.slice(0, 25), 26))
    render(<MovimientosPage />)
    // Esperar a que carguen los datos
    await screen.findAllByText('Movimiento 1')

    // Hay 26 movimientos pero solo se muestran 25 (PAGE_SIZE = 25)
    expect(screen.getAllByText('Movimiento 1').length).toBeGreaterThan(0)
    expect(screen.queryByText('Movimiento 26')).not.toBeInTheDocument()

    // El texto de paginación debe indicar el total
    expect(screen.getByText(/26/)).toBeInTheDocument()
  })
})
