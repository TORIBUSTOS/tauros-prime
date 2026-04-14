# UI/UX Map: TAUROS (Imperial Tech)

## 1. Identidad Visual
- **Estilo**: *Financial Glassmorphism* & *Imperial Tech*.
- **Concepto**: Una consola de mando táctica que enfatiza la inteligencia sobre la operación.
- **Paleta de Colores**:
  - `Background`: #000000 (Pure Black).
  - `Surface`: #0a0a0a con desenfoque de fondo y bordes de 1px (Rim Lighting).
  - `Accent`: Cian Imperial / Dorado Prime (gradientes).

## 2. Inventario de Pantallas

| Pantalla | Propósito | Widget Estrella |
| :--- | :--- | :--- |
| **Dashboard** | El centro de mando | **Cortex Hub** (Feed de IA) |
| **Reportes** | Auditoría P&L | Desglose Jerárquico Recursivo |
| **Analytics** | Proyección Futura | **Predictive Forecast Chart** |
| **Movimientos** | Revisión de datos | Tabla Densa con Semáforos de Calidad |

## 3. Patrones de Diseño (Imperial Tech)

### A. Cortex Insights Flow
1. Al cargar, el sistema ejecuta una animación de "Escaneo" en el Cortex Hub.
2. Los hallazgos se clasifican en:
   - **Críticos (Rojo)**: Alertas de liquidez inminente.
   - **Patrones (Azul)**: Gastos recurrentes o anomalías de tendencia.
   - **Neutrales (Gris)**: Metadata e información de auditoría.

### B. Glass & Rim Design
- Paneles con `backdrop-filter: blur(12px)`.
- Bordes con gradiente lineal (`--border-imperial`) para simular profundidad.
- Sombras suaves externas que separan los elementos del fondo absoluto.

## 4. User Journeys (UX)

### Auditoría Predictiva
1. El usuario revisa el **Cortex Hub**.
2. Detecta una alerta de "Gasto recurrente anómalo".
3. Hace click en el "Hallazgo" para ir al detalle filtrado en **Reportes**.
4. Valida si la proyección de la categoría coincide con la realidad.

## 5. Responsividad
Adaptado para monitores UltraWide y Tablets Pro. No se prioriza la visualización móvil debido a la densidad de datos requerida para el análisis financiero experto.
