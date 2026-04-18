import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoriasPage from './page'
import { apiService } from '@/services/api.service'
import { mockCategories, mockRules } from '@/test/fixtures'

// ── Mocks de servicio ────────────────────────────────────────────────────────

vi.mock('@/services/api.service', () => ({
  apiService: {
    getCategories: vi.fn(),
    getRules: vi.fn(),
    getMovements: vi.fn(),
    getSubcategoriaStats: vi.fn(),
  },
}))

// ── Mock de ToastContext ─────────────────────────────────────────────────────

const mockShowToast = vi.fn()
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

function setupSuccessfulAPIs() {
  vi.mocked(apiService.getCategories).mockResolvedValue(mockCategories)
  vi.mocked(apiService.getRules).mockResolvedValue(mockRules)
  // getMovements se llama dentro de TabSinCategorizar si se abre esa tab
  vi.mocked(apiService.getMovements).mockResolvedValue([])
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CategoriasPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockShowToast.mockClear()
  })

  it('renderiza LoadingImperial "Cargando sistema de categorías..."', () => {
    vi.mocked(apiService.getCategories).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiService.getRules).mockImplementation(() => new Promise(() => {}))
    render(<CategoriasPage />)
    expect(screen.getByText('Cargando sistema de categorías...')).toBeInTheDocument()
  })

  it('muestra los 3 tabs después de cargar', async () => {
    setupSuccessfulAPIs()
    render(<CategoriasPage />)
    expect(await screen.findByRole('button', { name: /Resumen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Motor Cascada/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sin Categorizar/i })).toBeInTheDocument()
  })

  it('muestra badge con el conteo de categorías en el tab Resumen', async () => {
    setupSuccessfulAPIs()
    render(<CategoriasPage />)
    await screen.findByRole('button', { name: /Resumen/i })
    // mockCategories tiene 3 categorías
    const badges = screen.getAllByText('3')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('muestra badge con el conteo de reglas activas en Motor Cascada', async () => {
    setupSuccessfulAPIs()
    render(<CategoriasPage />)
    await screen.findByRole('button', { name: /Motor Cascada/i })
    // mockRules tiene 2 reglas con activo=1 (id 1 y 2, id 3 es activo=0)
    const badges = screen.getAllByText('2')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('cambia al contenido del Motor Cascada al hacer click en ese tab', async () => {
    setupSuccessfulAPIs()
    render(<CategoriasPage />)
    await screen.findByRole('button', { name: /Motor Cascada/i })

    await userEvent.click(screen.getByRole('button', { name: /Motor Cascada/i }))

    // TabMotor renderiza un input con placeholder "Buscar patrón o categoría..."
    expect(screen.getByPlaceholderText(/Buscar patrón o categoría/i)).toBeInTheDocument()
  })

  it('cambia al tab Sin Categorizar y muestra su contenido', async () => {
    setupSuccessfulAPIs()
    render(<CategoriasPage />)
    await screen.findByRole('button', { name: /Sin Categorizar/i })

    await userEvent.click(screen.getByRole('button', { name: /Sin Categorizar/i }))

    // TabSinCategorizar llama getMovements y cuando no hay sin categorizar muestra "Todo categorizado"
    expect(await screen.findByText('Todo categorizado')).toBeInTheDocument()
  })

  it('muestra toast de error cuando getCategories falla', async () => {
    vi.mocked(apiService.getCategories).mockRejectedValue(new Error('Error al cargar categorías'))
    vi.mocked(apiService.getRules).mockResolvedValue(mockRules)
    render(<CategoriasPage />)
    await vi.waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error al cargar categorías', 'error')
    })
  })
})
