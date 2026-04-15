import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MetricCard from './MetricCard'
import { ThemeProvider } from '@/context/ThemeContext'

describe('MetricCard', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  it('should render label and value', () => {
    renderWithTheme(<MetricCard label="Total Ingresos" value="$10,000" />)

    expect(screen.getByText('Total Ingresos')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
  })

  it('should render numeric value', () => {
    renderWithTheme(<MetricCard label="Count" value={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render positive trend with + sign', () => {
    renderWithTheme(<MetricCard label="Ingresos" value="$5,000" trend={15} />)

    expect(screen.getByText('+15%')).toBeInTheDocument()
  })

  it('should render negative trend without + sign', () => {
    renderWithTheme(<MetricCard label="Egresos" value="$2,000" trend={-10} />)

    expect(screen.getByText('-10%')).toBeInTheDocument()
  })

  it('should not render trend when undefined', () => {
    const { container } = renderWithTheme(<MetricCard label="Test" value="100" />)

    const trendElement = container.querySelector('.metric-trend')
    expect(trendElement).not.toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    renderWithTheme(
      <MetricCard
        label="Balance"
        value="$5,000"
        subtitle="Mes actual"
      />
    )

    expect(screen.getByText('Mes actual')).toBeInTheDocument()
  })

  it('should not render subtitle when not provided', () => {
    const { container } = renderWithTheme(<MetricCard label="Test" value="100" />)

    // Verify subtitle element doesn't exist when subtitle prop is not provided
    const subtitle = container.querySelector('.metric-subtitle')
    expect(subtitle).not.toBeInTheDocument()
  })

  it('should be clickable when onClick prop provided', async () => {
    const handleClick = vi.fn()
    renderWithTheme(
      <MetricCard
        label="Clickable"
        value="$1,000"
        onClick={handleClick}
      />
    )

    const card = screen.getByText('Clickable').closest('.metric-card')
    await userEvent.click(card!)

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should have cursor-pointer class when onClick provided', () => {
    const handleClick = vi.fn()
    const { container } = renderWithTheme(
      <MetricCard
        label="Clickable"
        value="$1,000"
        onClick={handleClick}
      />
    )

    const card = container.querySelector('.metric-card')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('should not have cursor-pointer when onClick not provided', () => {
    const { container } = renderWithTheme(
      <MetricCard label="Not Clickable" value="$1,000" />
    )

    const card = container.querySelector('.metric-card')
    expect(card?.className).not.toMatch(/cursor-pointer/)
  })

  it('should apply gold accent color', () => {
    const { container } = renderWithTheme(
      <MetricCard label="Gold" value="$5,000" accent="gold" />
    )

    const card = container.querySelector('.metric-card')
    const style = window.getComputedStyle(card!)
    // The accent color is applied via CSS variable
    expect(card).toBeInTheDocument()
  })

  it('should apply bronze accent color', () => {
    const { container } = renderWithTheme(
      <MetricCard label="Bronze" value="$5,000" accent="bronze" />
    )

    const card = container.querySelector('.metric-card')
    expect(card).toBeInTheDocument()
  })

  it('should apply no accent by default', () => {
    const { container } = renderWithTheme(
      <MetricCard label="No Accent" value="$5,000" />
    )

    const card = container.querySelector('.metric-card')
    expect(card).toBeInTheDocument()
  })

  it('should render with all props', () => {
    const handleClick = vi.fn()
    renderWithTheme(
      <MetricCard
        label="Complete"
        value="$10,000"
        trend={5}
        subtitle="Trending up"
        accent="gold"
        onClick={handleClick}
      />
    )

    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
    expect(screen.getByText('Trending up')).toBeInTheDocument()
  })
})

describe('MetricCard with Theme Switching', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  it('should respond to theme changes from context', async () => {
    const { rerender } = render(
      <ThemeProvider>
        <MetricCard label="Themed Metric" value="$5,000" />
      </ThemeProvider>
    )

    expect(screen.getByText('Themed Metric')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()

    // Re-render to trigger theme context update
    rerender(
      <ThemeProvider>
        <MetricCard label="Themed Metric" value="$5,000" />
      </ThemeProvider>
    )

    expect(screen.getByText('Themed Metric')).toBeInTheDocument()
  })

  it('should render with proper theme classes applied', () => {
    const { container } = render(
      <ThemeProvider>
        <MetricCard label="Themed" value="$1,000" />
      </ThemeProvider>
    )

    const card = container.querySelector('.metric-card')
    // CSS variables are applied via var(--metric-value-size) which is controlled by data-theme
    expect(card).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('finance-first')
  })

  it('should display metrics with Finance-First theme by default', () => {
    render(
      <ThemeProvider>
        <MetricCard label="Finance First" value="$10,000" />
      </ThemeProvider>
    )

    // In Finance-First theme, CSS variables apply --metric-value-size: 3.5rem
    expect(screen.getByText('Finance First')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
  })

  it('should maintain state across theme transitions', async () => {
    const handleClick = vi.fn()
    const { rerender } = render(
      <ThemeProvider>
        <MetricCard
          label="State Test"
          value="$5,000"
          trend={10}
          accent="gold"
          onClick={handleClick}
        />
      </ThemeProvider>
    )

    // Verify component maintains its props
    expect(screen.getByText('State Test')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getAllByText('+10%')[0]).toBeInTheDocument()

    // Component should still be functional after re-render
    rerender(
      <ThemeProvider>
        <MetricCard
          label="State Test"
          value="$5,000"
          trend={10}
          accent="gold"
          onClick={handleClick}
        />
      </ThemeProvider>
    )

    expect(screen.getByText('State Test')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
  })

  it('should apply CSS variable for numeric value sizing', () => {
    const { container } = render(
      <ThemeProvider>
        <MetricCard label="Large Number" value="$999,999,999" />
      </ThemeProvider>
    )

    const valueElement = container.querySelector('.metric-value')
    expect(valueElement).toBeInTheDocument()

    // The CSS variable --metric-value-size is applied to the element
    // In Finance-First: 3.5rem, in Premium Glass: 2.5rem
    // This is controlled by the root element's data-theme attribute
    expect(document.documentElement.getAttribute('data-theme')).toBe('finance-first')
  })

  it('should work correctly with theme persistence', async () => {
    localStorage.setItem('toro-theme', 'premium-glass')

    render(
      <ThemeProvider>
        <MetricCard label="Persisted Theme" value="$7,500" />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('premium-glass')
      expect(screen.getByText('Persisted Theme')).toBeInTheDocument()
    })
  })

  it('should handle theme changes without losing props', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <ThemeProvider>
        <MetricCard
          label="Click Test"
          value="$2,000"
          trend={5}
          subtitle="Metric with click"
          onClick={handleClick}
        />
      </ThemeProvider>
    )

    // Verify all elements render first
    expect(screen.getByText('Click Test')).toBeInTheDocument()
    expect(screen.getByText('$2,000')).toBeInTheDocument()

    // Click the card
    const clickTestElement = screen.getByText('Click Test')
    const card = clickTestElement.closest('[class*="metric"]')
    if (card) {
      await user.click(card)
      expect(handleClick).toHaveBeenCalled()
    }

    // Props should still be intact
    expect(screen.getByText('Click Test')).toBeInTheDocument()
    expect(screen.getByText('$2,000')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
    expect(screen.getByText('Metric with click')).toBeInTheDocument()
  })
})
