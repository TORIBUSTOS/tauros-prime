import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, RenderResult } from '@testing-library/react'
import RecentTransactions from './RecentTransactions'
import { ThemeProvider } from '@/context/ThemeContext'
import { MovimientoMapped } from '../../types/api'

describe('RecentTransactions', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  const renderWithTheme = (component: React.ReactElement): RenderResult => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }
  const mockMovements: MovimientoMapped[] = [
    {
      id: '1',
      fecha: '2025-06-15',
      descripcion: 'Pago de servicios',
      monto: -5000,
      categoria: 'Servicios',
      tipo: 'egreso',
      confianza: 0.95,
      periodo: '2025-06',
    },
    {
      id: '2',
      fecha: '2025-06-14',
      descripcion: 'Depósito de cliente',
      monto: 15000,
      categoria: 'Ingresos',
      tipo: 'ingreso',
      confianza: 0.88,
      periodo: '2025-06',
    },
    {
      id: '3',
      fecha: '2025-06-13',
      descripcion: 'Transferencia bancaria con descripción muy larga que debería truncarse correctamente',
      monto: -8500,
      categoria: 'Transferencias',
      tipo: 'egreso',
      confianza: 0.65,
      periodo: '2025-06',
    },
  ]

  it('should render with empty movements list', () => {
    renderWithTheme(<RecentTransactions movements={[]} />)

    expect(screen.getByText('Bóveda Reciente')).toBeInTheDocument()
    expect(screen.getByText('Sin movimientos registrados')).toBeInTheDocument()
  })

  it('should render section title', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    expect(screen.getByText('Bóveda Reciente')).toBeInTheDocument()
  })

  it('should render view all link', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    expect(screen.getByText('Expediente Completo')).toBeInTheDocument()
  })

  it('should render all movements', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    expect(screen.getByText('Pago de servicios')).toBeInTheDocument()
    expect(screen.getByText('Depósito de cliente')).toBeInTheDocument()
  })

  it('should display ingreso amount in green', () => {
    renderWithTheme(<RecentTransactions movements={[mockMovements[1]]} />)

    const amount = screen.getByText(/15.000/)
    expect(amount).toHaveClass('text-success')
  })

  it('should display egreso amount with minus sign', () => {
    renderWithTheme(<RecentTransactions movements={[mockMovements[0]]} />)

    const amountText = screen.getByText(/^-/)
    expect(amountText.textContent).toContain('-')
  })

  it('should display egreso amount in white', () => {
    renderWithTheme(<RecentTransactions movements={[mockMovements[0]]} />)

    const amount = screen.getByText(/^-/)
    expect(amount).toHaveClass('text-error')
  })

  it('should display category for each movement', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    expect(screen.getByText('Servicios')).toBeInTheDocument()
    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Transferencias')).toBeInTheDocument()
  })

  it('should show confidence when below 80%', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    // Movement with confianza 0.65 should show
    expect(screen.getByText('AI 65% confianza')).toBeInTheDocument()
  })

  it('should not show confidence when at or above 80%', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    // Movements with confianza >= 0.80 should not show confidence
    expect(screen.queryByText('95% confianza')).not.toBeInTheDocument()
    expect(screen.queryByText('88% confianza')).not.toBeInTheDocument()
  })

  it('should format dates in Spanish format', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={mockMovements} />)

    // Check for Spanish month abbreviations in the date elements
    const dateElements = container.querySelectorAll('.date')
    expect(dateElements.length).toBe(3)
    expect(dateElements[0].textContent).toMatch(/jun|may|abr/i)
  })

  it('should display transaction descriptions', () => {
    renderWithTheme(<RecentTransactions movements={mockMovements} />)

    expect(screen.getByTitle('Transferencia bancaria con descripción muy larga que debería truncarse correctamente')).toBeInTheDocument()
  })

  it('should have transaction items with correct structure', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={mockMovements} />)

    const transactionItems = container.querySelectorAll('.transaction-item')
    expect(transactionItems.length).toBe(3)
  })

  it('should have icon containers for each movement', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={mockMovements} />)

    const iconContainers = container.querySelectorAll('.icon-container')
    expect(iconContainers.length).toBe(3)
  })

  it('should have correct icon class for ingreso', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={[mockMovements[1]]} />)

    const iconContainer = container.querySelector('.icon-container.ingreso')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should have correct icon class for egreso', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={[mockMovements[0]]} />)

    const iconContainer = container.querySelector('.icon-container.egreso')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should render container with correct base class', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={mockMovements} />)

    const mainContainer = container.querySelector('.transactions-container')
    expect(mainContainer).toBeInTheDocument()
  })

  it('should have transactions list element', () => {
    const { container } = renderWithTheme(<RecentTransactions movements={mockMovements} />)

    const list = container.querySelector('.transactions-list')
    expect(list).toBeInTheDocument()
  })

  it('should format large currency amounts correctly', () => {
    const movements: MovimientoMapped[] = [
      {
        id: '1',
        fecha: '2025-06-15',
        descripcion: 'Large transaction',
        monto: 1234567,
        categoria: 'Test',
        tipo: 'ingreso',
        confianza: 0.9,
        periodo: '2025-06',
      },
    ]

    renderWithTheme(<RecentTransactions movements={movements} />)

    // Format should be 1.234.567 for 1234567 in es-AR
    expect(screen.getByText(/1\.234\.567/)).toBeInTheDocument()
  })

  it('should handle single movement', () => {
    renderWithTheme(<RecentTransactions movements={[mockMovements[0]]} />)

    expect(screen.getByText('Pago de servicios')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de cliente')).not.toBeInTheDocument()
  })

  it('should show correct amount for decimal values', () => {
    const movements: MovimientoMapped[] = [
      {
        id: '1',
        fecha: '2025-06-15',
        descripcion: 'Decimal transaction',
        monto: 1234.56,
        categoria: 'Test',
        tipo: 'ingreso',
        confianza: 0.9,
        periodo: '2025-06',
      },
    ]

    renderWithTheme(<RecentTransactions movements={movements} />)

    expect(screen.getByText(/1\.234,56/)).toBeInTheDocument()
  })

  it('should handle negative ingreso correctly', () => {
    const movements: MovimientoMapped[] = [
      {
        id: '1',
        fecha: '2025-06-15',
        descripcion: 'Test',
        monto: -5000,
        categoria: 'Test',
        tipo: 'ingreso',
        confianza: 0.9,
        periodo: '2025-06',
      },
    ]

    renderWithTheme(<RecentTransactions movements={movements} />)

    // Should show 5000 without minus for ingreso
    expect(screen.getByText(/5\.000/)).toBeInTheDocument()
  })
})
