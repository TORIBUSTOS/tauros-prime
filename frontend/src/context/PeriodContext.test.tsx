import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeriodProvider, usePeriod } from './PeriodContext'
import * as apiService from '../services/api.service'

// Mock API service
vi.mock('../services/api.service', () => ({
  apiService: {
    getPeriods: vi.fn(),
  },
}))

// Test component that uses the context
function TestComponent() {
  const { selectedPeriod, setSelectedPeriod, availablePeriods, isLoading, refreshPeriods } = usePeriod()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="selected">{selectedPeriod}</div>
      <div data-testid="periods">{availablePeriods.join(',')}</div>
      <button onClick={() => setSelectedPeriod('2025-08')}>Select 2025-08</button>
      <button onClick={() => refreshPeriods()}>Refresh</button>
    </div>
  )
}

describe('PeriodContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide period context with initial values', async () => {
    const mockPeriods = ['2025-06', '2025-07', '2025-08']
    ;(apiService.apiService.getPeriods as any).mockResolvedValueOnce(mockPeriods)

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('periods')).toHaveTextContent('2025-06,2025-07,2025-08')
    expect(screen.getByTestId('selected')).toHaveTextContent('2025-06')
  })

  it('should set first period as default when periods loaded', async () => {
    const mockPeriods = ['2025-08', '2025-07', '2025-06']
    ;(apiService.apiService.getPeriods as any).mockResolvedValueOnce(mockPeriods)

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected')).toHaveTextContent('2025-08')
    })
  })

  it('should update selected period when setSelectedPeriod is called', async () => {
    const mockPeriods = ['2025-06', '2025-07', '2025-08']
    ;(apiService.apiService.getPeriods as any).mockResolvedValueOnce(mockPeriods)

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected')).toHaveTextContent('2025-06')
    })

    const button = screen.getByText('Select 2025-08')
    await userEvent.click(button)

    expect(screen.getByTestId('selected')).toHaveTextContent('2025-08')
  })

  it('should show loading state initially', () => {
    const mockPeriods = ['2025-06', '2025-07']
    ;(apiService.apiService.getPeriods as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  })

  it('should handle empty periods list', async () => {
    ;(apiService.apiService.getPeriods as any).mockResolvedValueOnce([])

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('periods')).toHaveTextContent('')
    expect(screen.getByTestId('selected')).toHaveTextContent('')
  })

  it('should refresh periods when refreshPeriods is called', async () => {
    const mockPeriods1 = ['2025-06', '2025-07']
    const mockPeriods2 = ['2025-06', '2025-07', '2025-08']
    ;(apiService.apiService.getPeriods as any)
      .mockResolvedValueOnce(mockPeriods1)
      .mockResolvedValueOnce(mockPeriods2)

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('periods')).toHaveTextContent('2025-06,2025-07')
    })

    const refreshButton = screen.getByText('Refresh')
    await userEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByTestId('periods')).toHaveTextContent('2025-06,2025-07,2025-08')
    })
  })

  it('should handle API errors gracefully', async () => {
    ;(apiService.apiService.getPeriods as any).mockRejectedValueOnce(
      new Error('API error')
    )

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    // Should have empty periods and selected period
    expect(screen.getByTestId('periods')).toHaveTextContent('')
    expect(screen.getByTestId('selected')).toHaveTextContent('')
  })

  it('should throw error when usePeriod is used outside provider', () => {
    function ComponentWithoutProvider() {
      usePeriod()
      return null
    }

    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<ComponentWithoutProvider />)
    }).toThrow('usePeriod must be used within a PeriodProvider')

    spy.mockRestore()
  })

  it('should keep selected period if it still exists in new periods', async () => {
    const mockPeriods1 = ['2025-06', '2025-07', '2025-08']
    const mockPeriods2 = ['2025-06', '2025-07', '2025-08', '2025-09'] // 2025-09 added but 2025-08 remains
    ;(apiService.apiService.getPeriods as any)
      .mockResolvedValueOnce(mockPeriods1)
      .mockResolvedValueOnce(mockPeriods2)

    render(
      <PeriodProvider>
        <TestComponent />
      </PeriodProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected')).toHaveTextContent('2025-06')
    })

    // Change selected period
    await userEvent.click(screen.getByText('Select 2025-08'))
    expect(screen.getByTestId('selected')).toHaveTextContent('2025-08')

    // Refresh periods (2025-08 still exists)
    await userEvent.click(screen.getByText('Refresh'))

    // Selected period should remain
    await waitFor(() => {
      expect(screen.getByTestId('selected')).toHaveTextContent('2025-08')
    })
  })
})
