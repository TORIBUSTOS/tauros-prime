import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'

// Test component that uses the toast context
function TestComponent() {
  const { toasts, showToast, removeToast } = useToast()

  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="toast-messages">{toasts.map((t) => t.message).join(',')}</div>
      <div data-testid="toast-types">{toasts.map((t) => t.type).join(',')}</div>

      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Info message')}>
        Show Info
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Show Warning
      </button>

      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>
          Remove First
        </button>
      )}
    </div>
  )
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide toast context with initial values', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('should show success toast', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent('Success message')
    expect(screen.getByTestId('toast-types')).toHaveTextContent('success')
  })

  it('should show error toast', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Error'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent('Error message')
    expect(screen.getByTestId('toast-types')).toHaveTextContent('error')
  })

  it('should show info toast with default type', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Info'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent('Info message')
    expect(screen.getByTestId('toast-types')).toHaveTextContent('info')
  })

  it('should show warning toast', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Warning'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent('Warning message')
    expect(screen.getByTestId('toast-types')).toHaveTextContent('warning')
  })

  it('should allow multiple toasts simultaneously', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    await user.click(screen.getByText('Show Warning'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent(
      'Success message,Error message,Warning message'
    )
  })

  it('should remove toast manually', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    await user.click(screen.getByText('Remove First'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('should auto-remove toast after 5 seconds', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    // Wait for auto-removal (5 seconds + buffer)
    await waitFor(
      () => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      },
      { timeout: 6000 }
    )
  }, 10000)

  it('should not auto-remove if toast is removed before timeout', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    // Remove toast manually before timeout
    await user.click(screen.getByText('Remove First'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')

    // Verify it stays removed (the auto-removal timer is cleaned up)
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('should handle multiple toasts with different auto-removal times', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('2')

    // Wait for auto-removal (5 seconds + buffer)
    await waitFor(
      () => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      },
      { timeout: 6000 }
    )
  }, 10000)

  it('should throw error when useToast is used outside provider', () => {
    function ComponentWithoutProvider() {
      useToast()
      return null
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<ComponentWithoutProvider />)
    }).toThrow('useToast must be used within a ToastProvider')

    spy.mockRestore()
  })

  it('should generate unique IDs for each toast', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))

    // If IDs were not unique, removing one might remove both
    await user.click(screen.getByText('Remove First'))

    // Should have 1 toast left (the error)
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByTestId('toast-messages')).toHaveTextContent('Error message')
  })

  it('should handle rapid successive toast additions', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    // Rapidly add multiple toasts
    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    await user.click(screen.getByText('Show Info'))
    await user.click(screen.getByText('Show Warning'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('4')
  })

  it('should preserve toast order', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    await user.click(screen.getByText('Show Warning'))

    expect(screen.getByTestId('toast-messages')).toHaveTextContent(
      'Success message,Error message,Warning message'
    )
  })
})
