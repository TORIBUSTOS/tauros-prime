import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/context/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  it('should render button with Finance-First emoji by default', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByTitle(/Cambiar a Premium Glass/)
    expect(button).toBeInTheDocument()
    expect(screen.getByText('💰')).toBeInTheDocument()
    expect(screen.getByText('Financiero')).toBeInTheDocument()
  })

  it('should change emoji when theme is switched to Premium Glass', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    // After click, should show Premium Glass emoji
    expect(screen.getByText('✨')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('should toggle back to Finance-First when clicked again', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')

    // First click: Finance-First → Premium Glass
    await user.click(button)
    expect(screen.getByText('✨')).toBeInTheDocument()

    // Second click: Premium Glass → Finance-First
    await user.click(button)
    expect(screen.getByText('💰')).toBeInTheDocument()
  })

  it('should update title attribute based on current theme', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Cambiar a Premium Glass')

    await user.click(button)

    button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Cambiar a Finance-First')
  })

  it('should persist theme change to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(localStorage.getItem('toro-theme')).toBe('premium-glass')
  })

  it('should have correct styling classes', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    expect(button).toHaveClass('flex')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('gap-2')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-2')
    expect(button).toHaveClass('rounded-lg')
    expect(button).toHaveClass('transition-all')
    expect(button).toHaveClass('duration-300')
  })

  it('should hide text on small screens (hidden sm:inline)', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const textSpan = container.querySelector('.hidden.sm\\:inline')
    expect(textSpan).toBeInTheDocument()
  })

  it('should update DOM data-theme attribute when theme changes', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    // Initial state
    expect(document.documentElement.getAttribute('data-theme')).toBe('finance-first')

    // Click to change theme
    const button = screen.getByRole('button')
    await user.click(button)

    // Should update DOM
    expect(document.documentElement.getAttribute('data-theme')).toBe('premium-glass')
  })

  it('should be responsive with correct button styling', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    // Check for hover and focus states via classes
    expect(button).toHaveClass('hover:bg-white/10')
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('border-white/10')
  })
})
