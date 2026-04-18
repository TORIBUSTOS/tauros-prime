import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InsightCard from './InsightCard'
import { ThemeProvider } from '@/context/ThemeContext'
import { InsightItem } from '../../types/api'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockInsightAnomalia: InsightItem = {
  type: 'anomalia',
  confidence: 0.9,
  insight: 'Se detectó un patrón inusual en los gastos',
  categoria: 'Gastos',
  data: { monto: 5000, fecha: '2025-06-01' },
}

const mockInsightPatron: InsightItem = {
  type: 'patron',
  confidence: 0.75,  // Changed to 0.75 (between 0.5 and 0.8) for bronze color
  insight: 'Pago recurrente detectado cada mes',
  categoria: 'Suscripciones',
  data: { monto: 1000, fecha: '2025-06-05' },
}

const mockInsightOutlier: InsightItem = {
  type: 'outlier',
  confidence: 0.3,  // Low confidence (<0.4) for red color (text-error)
  insight: 'Gasto mayor al promedio histórico',
  categoria: 'Otros',
  data: { monto: 10000, fecha: '2025-06-10' },
}

describe('InsightCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  const renderWithTheme = (component: React.ReactElement): RenderResult => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  it('should render anomalia insight with AlertCircle icon', () => {
    renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    expect(screen.getByText('anomalia')).toBeInTheDocument()
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Se detectó un patrón inusual en los gastos')).toBeInTheDocument()
  })

  it('should render patron insight with TrendingUp icon', () => {
    renderWithTheme(<InsightCard insight={mockInsightPatron} />)

    expect(screen.getByText('patron')).toBeInTheDocument()
    expect(screen.getByText('Suscripciones')).toBeInTheDocument()
  })

  it('should render outlier insight with Zap icon', () => {
    renderWithTheme(<InsightCard insight={mockInsightOutlier} />)

    expect(screen.getByText('outlier')).toBeInTheDocument()
  })

  it('should display confidence percentage', () => {
    renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    // 0.9 * 100 = 90%
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('should format low confidence percentage', () => {
    renderWithTheme(<InsightCard insight={mockInsightOutlier} />)

    // 0.3 * 100 = 30%
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  it('should have analyze button with correct text', () => {
    renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    expect(screen.getByText(/Analizar/)).toBeInTheDocument()
  })

  it('should navigate to movimientos page on analyze click', async () => {
    const user = userEvent.setup()
    renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    const button = screen.getByText(/Analizar/)
    await user.click(button)

    expect(mockPush).toHaveBeenCalledWith('/movimientos?categoria=Gastos')
  })

  it('should properly encode categoria in URL', async () => {
    const user = userEvent.setup()
    const insight: InsightItem = {
      ...mockInsightAnomalia,
      categoria: 'Fondos Mutuos',
    }
    renderWithTheme(<InsightCard insight={insight} />)

    const button = screen.getByText(/Analizar/)
    await user.click(button)

    expect(mockPush).toHaveBeenCalledWith('/movimientos?categoria=Fondos%20Mutuos')
  })

  it('should apply class based on high confidence', () => {
    const { container } = renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    const iconBadge = container.querySelector('.icon-badge')
    // High confidence (>0.8) should have text-success class
    expect(iconBadge).toHaveClass('text-success')
  })

  it('should apply class based on medium confidence', () => {
    const { container } = renderWithTheme(<InsightCard insight={mockInsightPatron} />)

    const iconBadge = container.querySelector('.icon-badge')
    // Medium confidence (0.5-0.8) should have text-primary class
    expect(iconBadge).toHaveClass('text-primary')
  })

  it('should apply class based on low confidence', () => {
    const { container } = renderWithTheme(<InsightCard insight={mockInsightOutlier} />)

    const iconBadge = container.querySelector('.icon-badge')
    // Low confidence (<=0.5) should have text-error class
    expect(iconBadge).toHaveClass('text-error')
  })

  it('should render insight description correctly', () => {
    renderWithTheme(<InsightCard insight={mockInsightPatron} />)

    expect(screen.getByText('Pago recurrente detectado cada mes')).toBeInTheDocument()
  })

  it('should display correct insight type text class', () => {
    const { container } = renderWithTheme(<InsightCard insight={mockInsightPatron} />)

    const typeSpan = container.querySelector('.insight-type')
    expect(typeSpan).toHaveClass('text-primary')
  })

  it('should display confidence value with correct class', () => {
    const { container } = renderWithTheme(<InsightCard insight={mockInsightAnomalia} />)

    const confidenceValue = container.querySelector('.impact-value')
    expect(confidenceValue).toHaveClass('text-success')
  })

  it('should have proper structure for all insight types', () => {
    const { container: container1 } = renderWithTheme(
      <InsightCard insight={mockInsightAnomalia} />
    )

    expect(container1.querySelector('.insight-header')).toBeInTheDocument()
    expect(container1.querySelector('.insight-body')).toBeInTheDocument()
    expect(container1.querySelector('.insight-footer')).toBeInTheDocument()
  })
})
