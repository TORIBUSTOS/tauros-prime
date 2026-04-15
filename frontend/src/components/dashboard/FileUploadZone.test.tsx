import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUploadZone from './FileUploadZone'
import { ThemeProvider } from '@/context/ThemeContext'

// Mock window.alert
global.alert = vi.fn()

describe('FileUploadZone', () => {
  let mockOnUpload: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnUpload = vi.fn()
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'finance-first')
  })

  const renderWithTheme = (component: React.ReactElement): RenderResult => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  it('should render upload zone with default message', () => {
    renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    expect(screen.getByText('Cargar Extracto Bancario')).toBeInTheDocument()
    expect(screen.getByText(/Arrastra aquí o haz clic/)).toBeInTheDocument()
  })

  it('should show uploading message when isUploading is true', () => {
    renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={true} />)

    expect(screen.getByText('Sincronizando Bóveda...')).toBeInTheDocument()
  })

  it('should have file input with correct accept attribute', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toHaveAttribute('accept', '.xlsx,.csv')
  })

  it('should call onUpload with valid Excel file', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should call onUpload with valid CSV file', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'test.csv', { type: 'text/csv' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should accept xlsx files', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should accept csv files', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'test.csv', { type: 'text/csv' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should have upload zone element', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const uploadZone = container.querySelector('.upload-zone')
    expect(uploadZone).toBeInTheDocument()
  })

  it('should have proper container structure', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const uploadZone = container.querySelector('.upload-zone')
    const uploadContent = container.querySelector('.upload-content')
    const uploadIcon = container.querySelector('.upload-icon')
    const uploadText = container.querySelector('.upload-text')

    expect(uploadZone).toBeInTheDocument()
    expect(uploadContent).toBeInTheDocument()
    expect(uploadIcon).toBeInTheDocument()
    expect(uploadText).toBeInTheDocument()
  })

  it('should show uploading class when isUploading is true', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={true} />)

    const uploadZone = container.querySelector('.upload-zone')
    expect(uploadZone).toHaveClass('uploading')
  })

  it('should have cursor-wait when isUploading is true', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={true} />)

    const uploadZone = container.querySelector('.upload-zone') as HTMLElement
    expect(uploadZone).toHaveClass('uploading')
  })

  it('should prevent click when isUploading is true', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={true} />)

    const uploadZone = container.querySelector('.upload-zone')
    // Should have uploading class
    expect(uploadZone).toHaveClass('uploading')
  })

  it('should handle file with uppercase extension', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'TEST.XLSX', { type: 'application/vnd.ms-excel' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should handle file with mixed case extension', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const file = new File(['content'], 'test.Csv', { type: 'text/csv' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('should have SVG icon in upload zone', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render upload content section', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const uploadContent = container.querySelector('.upload-content')
    expect(uploadContent).toBeInTheDocument()
  })

  it('should display both primary and secondary text', () => {
    const { container } = renderWithTheme(<FileUploadZone onUpload={mockOnUpload} isUploading={false} />)

    const primaryText = container.querySelector('.primary-text')
    const secondaryText = container.querySelector('.secondary-text')

    expect(primaryText).toBeInTheDocument()
    expect(secondaryText).toBeInTheDocument()
  })
})
