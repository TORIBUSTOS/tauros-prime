# System Blueprint: TAUROS

## 1. Identidad
- **Nombre**: TAUROS (Codename del ecosistema TORO Holding)
- **Tipo de Sistema**: Financial Control & Corporate Management Platform
- **Propósito Principal**: Consolidar, categorizar y analizar movimientos bancarios dispersos para proporcionar una visión financiera unificada y estratégica.
- **Usuarios/Stakeholders**: CFO, Equipo de Finanzas, Dirección de TORO Holding.
- **Resultado Principal que Entrega**: Estado de Resultados (P&L) automatizado, Posición de Caja en tiempo real y KPIs predictivos de salud financiera.

## 2. Mapa Funcional
- **Funciones Principales**: 
  - **Consolidación Multi-banco**: Importación y normalización de extractos bancarios de diferentes entidades.
  - **Categorización Cascada v2.1**: Motor inteligente de 4 etapas que asigna categorías y subcategorías con >99% de efectividad.
  - **Auditoría de Metadata**: Extracción automática de CUIT, nombres de personas/comercios, CBU y referencias de transferencias.
  - **Analytics Pro**: Visualización de flujo diario, top de egresos y dashboards tipo Bento Grid.
  - **Reporting Ejecutivo**: Generación de reportes en PDF y Excel con jerarquía visual y detección de variaciones.
  - **Gestión de Batches**: Control de lotes de importación con capacidad de rollback y trazabilidad total.
  
- **Entradas del Sistema**: 
  - Archivos Excel/CSV: Extractos bancarios (Santander, BBVA, etc.).
  - Configuración JSON: Catálogo de 11 categorías y 51 subcategorías.
  - Reglas de Usuario: Definiciones manuales o aprendidas de categorización.
  
- **Procesos Clave**: 
  - **Ingesta → Limpieza**: Recibe el archivo y normaliza formatos.
  - **Metadata Extraer (Etapa 2)**: Detecta DNI/CUIL, nombres y tipos de operación (DEBIN, etc.).
  - **Cascada Rule Engine**: Aplica reglas de pattern matching y lógica de negocio para categorizar.
  - **Reporting Aggregation**: Calcula sumatorias por período, categoría y variaciones mensuales.
  
- **Salidas del Sistema**: 
  - Dashboard Web Interactivo.
  - Reportes Ejecutivos (PDF/Excel).
  - API REST documentada para integración.

## 3. Dominio y Lógica
- **Entidades Principales**: 
  - `Movimiento`: Transacción bancaria individual con su metadata y clasificación.
  - `Categoria` / `Subcategoria`: Estructura jerárquica del plan de cuentas.
  - `Regla (CascadaRule)`: Patrón de coincidencia con puntaje de confianza asociado.
  - `ImportBatch`: Registro del lote de importación para auditoría y borrado masivo.
  
- **Reglas de Negocio Críticas**: 
  - **Soberanía del Usuario**: Las clasificaciones manuales están "bloqueadas" y tienen prioridad sobre el motor automático.
  - **Consistencia de Período**: Los movimientos se agrupan en períodos mensuales (YYYY-MM) para análisis comparativo.
  - **Scoring de Confianza**: Cada categorización automática incluye un porcentaje de confianza basado en la fuente de la regla.
  
- **Flujos Principales**: 
  - **Cierre Mensual**: Importación de extractos → Categorización automática → Revisión de "Otros" → Generación de Reporte P&L.
  - **Ajuste de Reglas**: Identificación de patrón recurrente en "Otros" → Creación de nueva regla → Recategorización masiva.
  
- **Decisiones de Diseño**: 
  - **Arquitectura Desacoplada**: Backend en FastAPI y Frontend en React para máxima velocidad de renderizado.
  - **Motor de Categorización Offline (Túnel de Viento)**: Permite validar reglas con datos históricos sin impactar la base de datos productiva.

## 4. Arquitectura Técnica
- **Stack Principal**: 
  - **Frontend**: React 18 + Vite, CSS Vanilla (diseño premium/dark mode).
  - **Backend**: FastAPI (Python 3.12).
  - **Base de Datos**: SQLite (toro.db) con SQLAlchemy ORM.
  - **Infraestructura**: Despliegue local/on-prem con scripts de arranque automático (.bat/.sh).
  
- **Componentes/Módulos Principales**: 
  - `categorizador_cascada`: Lógica core para asignación de categorías.
  - `rule_engine (ingresos/egresos)`: Motores específicos por tipo de flujo.
  - `reporter / reportes_ejecutivos`: Motores de cálculo y generación de documentos.
  - `consolidar`: Lógica de integración de archivos bancarios.
  
- **Relaciones entre Componentes**: 
  - `Frontend` ↔ `FastAPI (API REST)` ↔ `Rule Engine` ↔ `SQLite`.
  
- **Estructura de Carpetas**: 
  ```
  tauros/
  ├── backend/
  │   ├── api/             # Endpoints FastAPI
  │   ├── core/            # Lógica de negocio (Categorización, Reportes)
  │   ├── models/           # Modelos SQLAlchemy/Pydantic
  │   └── database/        # Conexión y migraciones
  ├── frontend/
  │   ├── src/
  │   │   ├── components/  # UIs modulares (Charts, Grids)
  │   │   ├── pages/       # Dashboard, Analytics, Config
  │   │   └── state/       # Gestión de estado (hooks/api)
  └── docs/                # Documentación técnica y arquitectura
  ```
  
- **Dependencias Principales**: 
  - FastAPI: Framework web asíncrono.
  - SQLAlchemy: ORM para gestión de base de datos.
  - Pandas: Procesamiento de datos y transformación de archivos Excel.
  - React + Lucide Icons: Interfaz de usuario y set de iconos.
  - Pytest: Suite de pruebas automatizadas (>110 tests).

- **Base de Datos - Esquema Clave**: 
  - `movimientos` (id, fecha, descripcion, monto, categoria, subcategoria, confianza_porcentaje, batch_id, periodo, metadata_extraida).
  - `import_batches` (id, fecha_importacion, nombre_archivo, cantidad_movimientos).
  - `cascada_rules` (id, patron, categoria_id, subcategoria_id, prioridad).
  - `configuracion` (parámetros globales del sistema).
