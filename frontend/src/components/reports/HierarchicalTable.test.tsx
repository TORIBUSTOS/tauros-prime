import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HierarchicalTable from './HierarchicalTable';
import { ThemeProvider } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

// Mock de useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockNodos = [
  {
    nombre: 'INGRESOS OPERATIVOS',
    total: 50000,
    hijos: [
      {
        nombre: 'Ventas Directas',
        total: 30000,
        variacion: 10,
        hijos: [
          {
            nombre: 'Retail',
            total: 30000,
            hijos: [],
            movimientos: [
              { id: '1', fecha: '2024-03-01', descripcion: 'Venta A', monto: 15000 },
              { id: '2', fecha: '2024-03-02', descripcion: 'Venta B', monto: 15000 },
            ],
          }
        ],
        movimientos: [],
      }
    ],
    movimientos: [],
  },
  {
    nombre: 'EGRESOS OPERATIVOS',
    total: 20000,
    hijos: [],
    movimientos: [],
  }
];

describe('HierarchicalTable', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: pushMock });
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('debe renderizar los nodos raíz correctamente', () => {
    renderWithTheme(<HierarchicalTable nodos={mockNodos} />);
    
    expect(screen.getByText('INGRESOS OPERATIVOS')).toBeInTheDocument();
    expect(screen.getByText('EGRESOS OPERATIVOS')).toBeInTheDocument();
    // Usar regex para ser flexible con el separador de miles (. o ,)
    expect(screen.getByText(/50[.,]000/)).toBeInTheDocument();
    expect(screen.getByText(/20[.,]000/)).toBeInTheDocument();
  });

  it('debe expandir y contraer categorías al hacer clic', async () => {
    renderWithTheme(<HierarchicalTable nodos={mockNodos} />);
    
    // Por defecto las raíces están expandidas
    expect(screen.getByText('Ventas Directas')).toBeInTheDocument();
    
    // Hacer clic en el contenedor o el texto de la raíz para contraer
    const rootNode = screen.getByText('INGRESOS OPERATIVOS');
    fireEvent.click(rootNode);
    
    // Verificar que desaparece
    expect(screen.queryByText('Ventas Directas')).not.toBeInTheDocument();
  });

  it('debe mostrar variaciones si están presentes', () => {
    renderWithTheme(<HierarchicalTable nodos={mockNodos} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('debe navegar al detalle (drill-down) al hacer clic en el botón de exploración', () => {
    renderWithTheme(<HierarchicalTable nodos={mockNodos} />);
    
    const drillDownBtn = screen.getByTitle('Explorar Movimientos');
    fireEvent.click(drillDownBtn);
    
    expect(pushMock).toHaveBeenCalledWith('/movimientos?categoria=Ventas%20Directas');
  });

  it('debe mostrar movimientos al expandir una subcategoría', () => {
    renderWithTheme(<HierarchicalTable nodos={mockNodos} />);
    
    // Primero expandimos la categoría 'Ventas Directas' para que 'Retail' sea visible
    fireEvent.click(screen.getByText('Ventas Directas'));
    
    // Ahora 'Retail' debería ser visible
    const subCat = screen.getByText('Retail');
    expect(subCat).toBeInTheDocument();

    // Expandimos 'Retail' para ver los movimientos
    fireEvent.click(subCat);
    
    expect(screen.getByText('Venta A')).toBeInTheDocument();
    expect(screen.getByText('Venta B')).toBeInTheDocument();
    // Usar getAllByText ya que hay múltiples movimientos con el mismo monto en el mock
    expect(screen.getAllByText(/[\+\-]\$15[.,]000/)[0]).toBeInTheDocument();
  });
});
