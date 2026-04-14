# System Blueprint: TAUROS (Intelligence Hub)

## 1. Identidad
- **Nombre**: TAUROS v2
- **Tipo de Sistema**: Financial Intelligence & Predictive Dashboard
- **Propósito Principal**: Transformar datos bancarios crudos en proyecciones tácticas y hallazgos estratégicos mediante IA y análisis de patrones.
- **Scope**: **Intelligence-Only**. El sistema está diseñado para la visualización y predicción, excluyendo cualquier operación de ejecución financiera.

## 2. Mapa Funcional
- **Funciones Principales**: 
  - **Cortex Hub**: Centro neurálgico que unifica el análisis de liquidez con hallazgos proactivos de IA.
  - **Predictive Analytics**: Motor que proyecta el flujo de caja futuro basado en periocidad detectada.
  - **Categorización Cascada v2.1**: Motor inteligente de alta precisión para normalización de datos.
  - **Reporting Ejecutivo**: Generación de P&L interactivo y reportes de jerarquía financiera.
  - **Auditoría de Metadata**: Extracción de CUITs, nombres y referencias bancarias.
  
- **Entradas del Sistema**: 
  - Archivos Excel/CSV de extractos bancarios.
  - Reglas de negocio (Cascada rules).
  
- **Procesos Clave**: 
  - **Recurrence Analysis**: Detecta automáticamente gastos recurrentes analizando la frecuencia mensual.
  - **Flow Projection**: Calcula la posición de caja futura inyectando patrones detectados en el forecast.
  - **Cortex Insight Generation**: Sintetiza anomalías y oportunidades en el feed principal.
  
- **Salidas del Sistema**: 
  - Dashboard "Imperial Tech" con Cortex Hub.
  - Alertas proactivas de liquidez.
  - Reportes P&L jerárquicos.

## 3. Dominio y Lógica
- **Entidades Principales**: 
  - `Movimiento`: Dato atómico de transacción.
  - `CascadaRule`: Lógica de clasificación.
  - `ImportBatch`: Control de carga de datos.
  
- **Decisiones de Diseño**: 
  - **Reactividad Cortex**: El dashboard carga con un efecto de escaneo simulado para enfatizar el procesamiento inteligente.
  - **Soberanía de Datos**: Prioridad absoluta a las clasificaciones manuales de usuario.
  - **Estética Dark Premium**: Uso de Glassmorphism y Rim Lighting para reducir la fatiga visual en análisis densos.

## 4. Arquitectura Técnica
- **Stack Principal**: 
  - **Frontend**: Next.js 14, Tailwind CSS v4.
  - **Backend**: FastAPI (Python 3.12).
  - **Base de Datos**: SQLite (toro.db) con SQLAlchemy.
  
- **Estructura de Carpetas**: 
  ```
  tauros/
  ├── backend/src/
  │   ├── services/       # Forecast, Insights, Recurrence logic
  │   ├── models/         # SQLAlchemy schemas
  │   └── api/            # REST Endpoints
  ├── frontend/src/
  │   ├── components/     # dashboard/CortexHub, analytics/Forecast
  │   └── app/            # Next.js Pages
  └── MAPS/               # Intelligence documentation
  ```
, fecha_importacion, nombre_archivo, cantidad_movimientos).
  - `cascada_rules` (id, patron, categoria_id, subcategoria_id, prioridad).
  - `configuracion` (parámetros globales del sistema).
