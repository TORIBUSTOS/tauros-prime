import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeContext'

// Mock component to test the hook
function TestComponent() {
  const { currentTheme, setTheme } = useTheme()

  return (
    <div>
      <div data-testid="current-theme">{currentTheme}</div>
      <button onClick={() => setTheme('premium-glass')} data-testid="set-premium">
        Set Premium Glass
      </button>
      <button onClick={() => setTheme('finance-first')} data-testid="set-finance">
        Set Finance-First
      </button>
    </div>
  )
}

describe('ThemeContext & ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('ThemeProvider', () => {
    it('should render children correctly', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should initialize with finance-first theme by default', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('finance-first')
      })
    })

    it('should load saved theme from localStorage on mount', async () => {
      localStorage.setItem('toro-theme', 'premium-glass')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('premium-glass')
      })
    })

    it('should ignore invalid themes from localStorage', async () => {
      localStorage.setItem('toro-theme', 'invalid-theme' as any)

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('finance-first')
      })
    })
  })

  describe('useTheme Hook', () => {
    it('should throw error if used outside ThemeProvider', () => {
      // Create a component that uses the hook without provider
      function InvalidComponent() {
        useTheme()
        return <div>Invalid</div>
      }

      // This should throw an error
      expect(() => render(<InvalidComponent />)).toThrow(
        'useTheme debe estar dentro de <ThemeProvider>'
      )
    })

    it('should return currentTheme and setTheme function', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
      expect(screen.getByTestId('set-premium')).toBeInTheDocument()
      expect(screen.getByTestId('set-finance')).toBeInTheDocument()
    })

    it('should update currentTheme when setTheme is called', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('finance-first')

      await user.click(screen.getByTestId('set-premium'))

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('premium-glass')
      })
    })
  })

  describe('localStorage Persistence', () => {
    it('should save theme to localStorage when setTheme is called', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('set-premium'))

      expect(localStorage.getItem('toro-theme')).toBe('premium-glass')
    })

    it('should persist theme changes across multiple calls', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Change to premium
      await user.click(screen.getByTestId('set-premium'))
      expect(localStorage.getItem('toro-theme')).toBe('premium-glass')

      // Change back to finance
      await user.click(screen.getByTestId('set-finance'))
      expect(localStorage.getItem('toro-theme')).toBe('finance-first')

      // Change to premium again
      await user.click(screen.getByTestId('set-premium'))
      expect(localStorage.getItem('toro-theme')).toBe('premium-glass')
    })

    it('should restore theme from localStorage on remount', async () => {
      const user = userEvent.setup()

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Change theme
      await user.click(screen.getByTestId('set-premium'))
      expect(localStorage.getItem('toro-theme')).toBe('premium-glass')

      // Unmount
      unmount()

      // Remount - should restore premium-glass from localStorage
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('premium-glass')
      })
    })
  })

  describe('DOM Updates', () => {
    it('should set data-theme attribute on document element', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-theme')).toBe('finance-first')

      await user.click(screen.getByTestId('set-premium'))

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('premium-glass')
      })
    })

    it('should update data-theme attribute when theme changes', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      const expectedSequence = ['finance-first', 'premium-glass', 'finance-first']

      for (const expectedTheme of expectedSequence) {
        await waitFor(() => {
          expect(document.documentElement.getAttribute('data-theme')).toBe(expectedTheme)
        })

        if (expectedTheme === 'finance-first') {
          await user.click(screen.getByTestId('set-premium'))
        } else {
          await user.click(screen.getByTestId('set-finance'))
        }
      }
    })

    it('should apply data-theme on mount if localStorage has saved theme', async () => {
      localStorage.setItem('toro-theme', 'premium-glass')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('premium-glass')
      })
    })
  })

  describe('Theme Validation', () => {
    it('should only accept valid theme names', async () => {
      const user = userEvent.setup()
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Try valid theme
      await user.click(screen.getByTestId('set-premium'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('premium-glass')

      // Try another valid theme
      await user.click(screen.getByTestId('set-finance'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('finance-first')
    })

    it('should reject invalid theme names from localStorage', () => {
      // Set invalid theme in localStorage before render
      const invalidThemes = ['dark', 'light', 'invalid-theme', '']

      invalidThemes.forEach((theme) => {
        localStorage.clear()
        localStorage.setItem('toro-theme', theme)

        const { unmount } = render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        )

        // Should default to finance-first
        expect(screen.queryAllByTestId('current-theme')[0]).toHaveTextContent('finance-first')

        // Cleanup for next iteration
        unmount()
      })
    })
  })

  describe('Hydration & Mount', () => {
    it('should handle mount state correctly', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should initialize with finance-first (default)
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('finance-first')
      })

      // DOM should be updated
      expect(document.documentElement.getAttribute('data-theme')).toBe('finance-first')
    })

    it('should not cause hydration mismatch', async () => {
      // Simulate client-side hydration by setting a saved theme
      localStorage.setItem('toro-theme', 'premium-glass')

      // This should not cause hydration warnings
      const { container } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(container).toBeInTheDocument()
        expect(screen.getByTestId('current-theme')).toHaveTextContent('premium-glass')
      })
    })
  })
})
