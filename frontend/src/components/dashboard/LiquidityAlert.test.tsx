import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, RenderResult } from '@testing-library/react'
import LiquidityAlert from './LiquidityAlert'
import { ThemeProvider } from '@/context/ThemeContext'

describe('LiquidityAlert', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  const renderWithTheme = (component: React.ReactElement): RenderResult => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }
  it('should not render when there is no critical or warning condition', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={9000}
        confidence={0.85}
      />
    )

    const alert = container.querySelector('.liquidity-alert')
    expect(alert).not.toBeInTheDocument()
  })

  it('should render critical alert when projected balance is negative', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    expect(screen.getByText(/Riesgo de Liquidez Crítico/)).toBeInTheDocument()
  })

  it('should render warning alert when projected balance falls below 20% threshold', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={1500}  // 15% of 10000
        confidence={0.80}
      />
    )

    expect(screen.getByText(/Alerta de Disponibilidad/)).toBeInTheDocument()
  })

  it('should display critical message text', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    expect(screen.getByText(/La bóveda proyecta un/)).toBeInTheDocument()
    expect(screen.getByText(/déficit/)).toBeInTheDocument()
  })

  it('should display warning message text', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={1500}
        confidence={0.80}
      />
    )

    expect(screen.getByText(/El flujo proyectado indica una caída por debajo del/)).toBeInTheDocument()
    expect(screen.getByText(/Umbral Imperial/)).toBeInTheDocument()
  })

  it('should display confidence percentage', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    expect(screen.getByText(/85%/)).toBeInTheDocument()
  })

  it('should format confidence percentage correctly for low values', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.45}
      />
    )

    expect(screen.getByText(/45%/)).toBeInTheDocument()
  })

  it('should format confidence percentage correctly for high values', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.99}
      />
    )

    expect(screen.getByText(/99%/)).toBeInTheDocument()
  })

  it('should have alert icon', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    const icon = container.querySelector('.alert-icon svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have action button', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    expect(screen.getByText('Mitigar Riesgo')).toBeInTheDocument()
  })

  it('should have critical class when critical', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    const alert = container.querySelector('.liquidity-alert')
    expect(alert).toHaveClass('critical')
  })

  it('should have warning class when warning', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={1500}
        confidence={0.80}
      />
    )

    const alert = container.querySelector('.liquidity-alert')
    expect(alert).toHaveClass('warning')
  })

  it('should display formatted negative balance in critical message', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-2500}
        confidence={0.85}
      />
    )

    // Should show the absolute value (2500) in the message
    const message = screen.getByText(/La bóveda proyecta un/)
    expect(message.textContent).toContain('2.500')
  })

  it('should handle exact 20% threshold as warning', () => {
    const currentBalance = 10000
    const projectedBalance = 2000 // Exactly 20%

    renderWithTheme(
      <LiquidityAlert
        currentBalance={currentBalance}
        projectedBalance={projectedBalance}
        confidence={0.80}
      />
    )

    // Should NOT show (not below 20%, equals 20%)
    const alert = document.querySelector('.liquidity-alert')
    expect(alert).not.toBeInTheDocument()
  })

  it('should handle just below 20% threshold as warning', () => {
    const currentBalance = 10000
    const projectedBalance = 1999 // Just below 20%

    renderWithTheme(
      <LiquidityAlert
        currentBalance={currentBalance}
        projectedBalance={projectedBalance}
        confidence={0.80}
      />
    )

    // Should show warning
    expect(screen.getByText(/Alerta de Disponibilidad/)).toBeInTheDocument()
  })

  it('should render alert content with proper z-index stacking', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    const alertBlur = container.querySelector('.alert-blur')
    const alertContent = container.querySelector('.alert-content')

    expect(alertBlur).toBeInTheDocument()
    expect(alertContent).toBeInTheDocument()
  })

  it('should handle zero current balance', () => {
    renderWithTheme(
      <LiquidityAlert
        currentBalance={0}
        projectedBalance={-1000}
        confidence={0.85}
      />
    )

    // Should render critical alert
    expect(screen.getByText(/Riesgo de Liquidez Crítico/)).toBeInTheDocument()
  })

  it('should have animate-in class for animation', () => {
    const { container } = renderWithTheme(
      <LiquidityAlert
        currentBalance={10000}
        projectedBalance={-5000}
        confidence={0.85}
      />
    )

    const alert = container.querySelector('.liquidity-alert')
    expect(alert).toHaveClass('animate-in')
  })
})
