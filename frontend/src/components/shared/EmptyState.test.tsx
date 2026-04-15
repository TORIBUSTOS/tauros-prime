import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('should render with default title and message', () => {
    render(<EmptyState />)

    expect(screen.getByText('Bóveda Vacía')).toBeInTheDocument()
    expect(
      screen.getByText('No se encontraron registros para el periodo seleccionado.')
    ).toBeInTheDocument()
  })

  it('should render with custom title and message', () => {
    render(
      <EmptyState
        title="Custom Title"
        message="Custom message"
      />
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })

  it('should render database icon', () => {
    const { container } = render(<EmptyState />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    const { container } = render(<EmptyState />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
  })
})
