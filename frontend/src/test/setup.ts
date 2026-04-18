import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock next/router (Pages Router - legacy)
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/navigation (App Router - used by all pages)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
  usePathname: vi.fn().mockReturnValue('/'),
}))

// Mock next/image (server component, fails in happy-dom)
vi.mock('next/image', () => ({
  default: ({ alt }: { src: string; alt: string }) => alt,
}))

// Mock fetch if needed
global.fetch = vi.fn()
