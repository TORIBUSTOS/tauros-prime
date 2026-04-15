import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingImperial from './LoadingImperial'

describe('LoadingImperial', () => {
  it('should render with default message', () => {
    render(<LoadingImperial />)

    expect(screen.getByText('Sincronizando')).toBeInTheDocument()
    expect(screen.getByText('Accediendo a la Bóveda Imperial...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingImperial message="Cargando datos..." />)

    expect(screen.getByText('Sincronizando')).toBeInTheDocument()
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('should render loading spinner', () => {
    const { container } = render(<LoadingImperial />)

    // Check for spinner elements
    const spinners = container.querySelectorAll('[class*="rounded-full"]')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('should have flex layout classes for centering', () => {
    const { container } = render(<LoadingImperial />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('should display spinner with animation classes', () => {
    const { container } = render(<LoadingImperial />)

    // Check for animate-spin and animate-pulse classes
    const spinningElement = container.querySelector('[class*="animate-spin"]')
    const pulsingElement = container.querySelector('[class*="animate-pulse"]')

    expect(spinningElement).toBeInTheDocument()
    expect(pulsingElement).toBeInTheDocument()
  })

  it('should have proper text styling classes', () => {
    const { container } = render(<LoadingImperial />)

    const syncText = screen.getByText('Sincronizando')
    expect(syncText).toHaveClass('text-sm', 'font-medium', 'uppercase')
  })

  it('should display message with secondary styling', () => {
    const { container } = render(<LoadingImperial message="Procesando..." />)

    const message = screen.getByText('Procesando...')
    expect(message).toHaveClass('text-[10px]', 'uppercase')
  })

  it('should maintain consistent spacing between spinner and text', () => {
    const { container } = render(<LoadingImperial />)

    // The outer flex-col has gap-6, the inner text container has gap-1
    const outerFlexCol = container.querySelector('.flex.flex-col.items-center.gap-6')
    const innerFlexCol = container.querySelector('[class*="flex-col"][class*="gap-1"]')

    expect(outerFlexCol).toBeInTheDocument()
    expect(innerFlexCol).toBeInTheDocument()
  })

  it('should have minimum height for layout', () => {
    const { container } = render(<LoadingImperial />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('min-h-[400px]')
  })

  it('should render spinner with correct dimensions', () => {
    const { container } = render(<LoadingImperial />)

    const spinnerContainer = container.querySelector('[class*="w-16"]')
    expect(spinnerContainer).toHaveClass('w-16', 'h-16')
  })

  it('should handle empty custom message', () => {
    const { container } = render(<LoadingImperial message="" />)

    expect(screen.getByText('Sincronizando')).toBeInTheDocument()
    // Should still render with empty message span
    const messageSpans = container.querySelectorAll('span')
    expect(messageSpans.length).toBeGreaterThan(0)
  })

  it('should render with flex-1 flex-col structure', () => {
    const { container } = render(<LoadingImperial />)

    const outerFlex = container.firstChild
    expect(outerFlex).toHaveClass('flex', 'flex-1')
  })

  it('should center content with specific layout classes', () => {
    const { container } = render(<LoadingImperial />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'flex-1', 'items-center', 'justify-center')
  })
})
