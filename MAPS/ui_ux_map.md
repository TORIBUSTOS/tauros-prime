# UI/UX Map: TAUROS

## 1. Identidad Visual
- **Estilo**: Moderno, Dark Mode Nativo, Premium.
- **Concepto**: *Financial Glassmorphism* & *Bento Grid*.
- **Paleta de Colores**:
  - `Background`: #000000 (Onyx Black).
  - `Surface`: #0a0a0a con bordes 1px variables.
  - `Accent (Primary)`: Azul/Cian vibrante.
  - `Semantic`: Verde (Ingresos), Rojo (Egresos), Amarillo (Pendientes/Otros).
- **Tipografía**: Inter / Sans-Serif moderna con pesos robustos para números.

## 2. Inventario de Pantallas

| Pantalla | Propósito | Características Clave |
| :--- | :--- | :--- |
| **Dashboard** | Visión de 30.000 pies | Bento Grid, Gráfico de flujo diario, Upload de archivos. |
| **Reportes** | Análisis P&L detallado | Jerarquía expandible (Ingresos/Egresos), Selector de período. |
| **Analytics** | Tendencias y Salud financiera | Gráficos de torta por categoría, KPIs predictivos. |
| **Metadata** | Auditoría y Clasificación | Tabla densa, semáforos de calidad de datos, edición masiva. |
| **Configuración** | Gestión del sistema | Edición de categorías y reglas del motor Cascada. |

## 3. Flujos de Usuario (User Flows)

### A. El "Happy Path" del Analista
1. Login → Dashboard.
2. Drag & Drop de extracto bancario (.xlsx).
3. Confirmación de importación (Toast notification).
4. El sistema procesa en background (Loader sutil).
5. Ir a **Reportes** para ver el impacto inmediato en el P&L.

### B. Ciclo de Mejora de Datos (Feedback Loop)
1. Detectar categoría "Otros" en **Reportes**.
2. Click en la celda para ir a **Metadata** (filtro automático).
3. Editar clasificación de un movimiento.
4. Crear una "Regla Sugerida" desde el modal de edición.
5. Ver cómo el resto de los movimientos similares se actualizan (Real-time).

## 4. Patrones de Diseño (UI Patterns)
- **Glassmorphism**: Paneles con `backdrop-filter: blur()`, semitransparentes.
- **Rim Lighting**: Bordes de 1px con gradientes para separar elementos en fondo negro.
- **Micro-interacciones**:
  - Hover de escala en widgets del Dashboard.
  - Transiciones suaves entre navegación lateral.
  - Indicadores de pulso para procesos activos.
- **Data Denseness**: Uso optimizado del espacio para mostrar grandes cantidades de transacciones sin abrumar.

## 5. Accesibilidad y Responsividad
- **Contraste**: Relación de contraste 4.5:1 mínima para textos legibles sobre fondo oscuro.
- **Responsive**: Diseño adaptativo para Desktop y Tablets (prioridad en análisis de escritorio).
- **Navegación**: Menú lateral (Sidebar) consistente con iconos descriptivos (Lucide/Phosphor).
