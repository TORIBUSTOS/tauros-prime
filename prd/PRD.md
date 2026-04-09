# PRD.md — Product Requirements Document de TORO_Prime

> Documento de requisitos técnicos y funcionales. Define QUÉ se construye en cada BN.

---

## 1. Resumen Ejecutivo

**TORO_Prime** es una plataforma de análisis financiero que transforma extractos bancarios en decisiones estratégicas de costos, flujo de caja y disponibilidad de fondos.

**Diferenciador clave**: Motor de INSIGHTS inteligente que filtra ruido (anomalías de timing) y resalta patrones reales.

**Stack**: FastAPI (Backend) + Next.js (Frontend) + SQLite (DB)

**Usuarios**: Single-user (CFO/Director de TORO)

**Deploy**: Local on-prem

---

## 2. Requisitos Funcionales por Bloque Negativo

### **BN-001: Ingesta & Categorización Cascada**

#### 2.1.1 Requisitos Funcionales

**RF-001**: El usuario puede subir un archivo Excel/CSV con extracto bancario
- Formato soportado: Excel (.xlsx), CSV
- Campos esperados: Fecha, Descripción, Monto
- Validación: Detecta campos faltantes, notifica al usuario
- Límite: Máximo 10.000 movimientos por upload

**RF-002**: Sistema normaliza formatos bancarios diferentes
- Bancos soportados (v1): Sanarte (y otros si aplica)
- Normalización: Fechas, monedas, descripción (trim + uppercase)
- Deduplicación: Hash de (fecha, descripción, monto)

**RF-003**: Categorización automática >99% confianza
- Motor cascada v2.2: patrones + reglas de negocio
- Salida: categoria + subcategoria + confidence_score
- Si no categoriza: cae en "Otros" (requiere revisión manual)

**RF-004**: Extracción de metadata
- CUIT/CUIL: RegEx `\d{2}-\d{8}-\d`
- Nombres propios: Palabras en mayúsculas post-palabras clave
- Referencias: Códigos alfanuméricos
- Tipo de operación: DEBIN, transferencia, etc.

**RF-005**: Auditoría de importación
- Cada upload crea un `batch` con: fecha, archivo, cantidad, usuario
- Posibilidad de rollback: elimina el batch y todos sus movimientos
- Trazabilidad: cada movimiento sabe su batch_id

**RF-006**: Validaciones de negocio
- Consistencia de signos: ingresos positivos, egresos negativos
- Período: detecta si es mensual, parcial, etc.
- Advertencias: "Este período tiene solo 15 días" (el usuario sabe)

---

#### 2.1.2 Requisitos Técnicos

**RT-001**: Modelo de datos

```
Movimiento:
  - id (UUID)
  - fecha (Date)
  - descripcion_original (String)
  - monto (Decimal)
  - tipo (Enum: Ingreso, Egreso, Transferencia)
  - categoria (FK)
  - subcategoria (FK)
  - periodo (String: YYYY-MM)
  - metadata_extraida (JSON)
  - confianza_porcentaje (Float 0-100)
  - clasificacion_locked (Boolean)
  - batch_id (FK)
  - created_at (Timestamp)
  - updated_at (Timestamp)

Categoria:
  - id (Int)
  - nombre (String, unique)
  - tipo (Enum)
  - color_hint (String hex)

Subcategoria:
  - id (Int)
  - categoria_id (FK)
  - nombre (String)
  - color_hint (String hex)

ImportBatch:
  - id (UUID)
  - fecha_importacion (Timestamp)
  - nombre_archivo (String)
  - total_movimientos (Int)
  - usuario_id (String)
  - estado (Enum: Success, Failed, Partial)

CascadaRule:
  - id (Int)
  - patron (String: regex o keyword)
  - categoria_id (FK)
  - subcategoria_id (FK)
  - prioridad (Int, 1 = highest)
  - source (Enum: Sistema, Usuario, AI-Derived)
  - confidence_hint (Float 0-1)
```

**RT-002**: API Endpoints

```
POST /api/import
  Input: file (multipart/form-data)
  Output: { batch_id, total, procesados, fallidos }
  
GET /api/movements?period=YYYY-MM&categoria=...
  Input: querystring filters
  Output: [ { id, fecha, descripcion, monto, categoria, confidence_score, metadata_extraida } ]
```

**RT-003**: Algoritmo de categorización

```
1. Extraer metadata (CUIT, nombres, referencias)
2. Aplicar cascada rules (orden por prioridad)
3. Cada regla calcula score de match (0-100)
4. Top match se aplica si score >= threshold (configurable)
5. Si ningún match >= threshold: "Otros"
6. Retornar: categoria + subcategoria + confidence
```

**RT-004**: Testing
- Mínimo 20 tests para parser (formatos, validaciones)
- Mínimo 30 tests para categorización (reglas, edge cases)
- Cobertura >85%

---

### **BN-002: Motor de INSIGHTS Inteligente**

#### 2.2.1 Requisitos Funcionales

**RF-007**: Detección de patrones recurrentes
- Analiza histórico de 3+ meses
- Detecta: pagos mensuales, quincenales, anuales
- Output: [ { concepto, frecuencia, última_fecha, próxima_estimada } ]

**RF-008**: Identificación de outliers
- Comparar cada gasto con su histórico
- Outlier = desviación > 2σ (dos desviaciones estándar)
- Flag: "OSPACA pagó 2x este mes" (contexto)

**RF-009**: Clasificación Ruido vs Real
- Ruido: anomalías de timing o calendario
- Real: cambios estructurales en patrones
- Ejemplo: "Ingresos +100% es OSPACA 2x por desfasaje, no cambio real"

**RF-010**: Scoring de anomalía
- Cada anomalía tiene score de importancia (0-100)
- No todo se resalta: solo lo que importa
- Output: [ { tipo, concepto, score, contexto, recomendación } ]

**RF-011**: Análisis de "hormigas" (pequeños gastos)
- Identifica categorías con muchos movimientos pequeños
- Top 10-20 "hormigas" que suman
- Ejemplo: "Servicios: 47 transacciones de $100-500 = $15.200 mensuales"

**RF-012**: Banderas de salud financiera
- Liquidez: ¿hay colchón?
- Tendencia: ¿crecemos o decrecemos?
- Estacionalidad: ¿hay picos predecibles?
- Riesgo: ¿hay concentración en pocos ingresos?

---

#### 2.2.2 Requisitos Técnicos

**RT-005**: Modelo de datos

```
Insight:
  - id (UUID)
  - periodo (String: YYYY-MM)
  - tipo (Enum: Patrón, Outlier, Anomalía, Oportunidad)
  - concepto (String)
  - valor (Decimal)
  - contexto (JSON)
  - score_importancia (Float 0-100)
  - recomendacion (String)
  - created_at (Timestamp)

PatronRecurrente:
  - id (Int)
  - concepto (String)
  - frecuencia (Enum: Mensual, Quincenal, Anual, Otra)
  - monto_promedio (Decimal)
  - ultimo_movimiento (Date)
  - proximamente_estimado (Date)
  - confianza (Float 0-1)
```

**RT-006**: Algoritmo de insights

```
Para cada período (mes):
  1. Cargar histórico (últimos 3+ meses)
  2. Detectar patrones recurrentes (frecuencia)
  3. Para cada movimiento:
     a. Calcular desviación vs histórico
     b. Si desviación > 2σ: es outlier
     c. Clasificar: ruido o real
  4. Calcular "hormigas": agrupar por categoría, contar movimientos
  5. Generar flags de salud (liquidez, tendencia, estacionalidad, riesgo)
  6. Retornar: [ { tipo, concepto, score, contexto } ] ordenado por score DESC
```

**RT-007**: API Endpoints

```
GET /api/insights?period=YYYY-MM
  Output: [ { tipo, concepto, valor, contexto, score_importancia, recomendacion } ]
  
GET /api/insights/patrones
  Output: [ { concepto, frecuencia, monto_promedio, próxima_estimada, confianza } ]
  
GET /api/insights/hormigas?period=YYYY-MM
  Output: [ { categoria, count, monto_total, movimientos_individuales } ]
  
GET /api/insights/salud?period=YYYY-MM
  Output: { liquidez_score, tendencia, estacionalidad_detectada, riesgo_concentracion }
```

**RT-008**: Testing
- Mínimo 25 tests para detección de patrones
- Mínimo 20 tests para outliers y clasificación
- Cobertura >85%

---

### **BN-003: Forecasting 3 meses**

#### 2.3.1 Requisitos Funcionales

**RF-013**: Proyección automática de flujo
- Basada en patrones detectados en histórico (3+ meses)
- Output: Proyección para los 3 próximos meses
- Incluye: ingresos, egresos, saldo neto

**RF-014**: Detección de estacionalidades
- Gastos que varían por estación (fin de año, verano, etc.)
- Ingresos recurrentes en períodos específicos
- Ajusta proyección en consecuencia

**RF-015**: Input manual de obligaciones puntuales
- Usuario puede agregar "sé que en Mayo hay una obligación de $50.000"
- El forecasting las incluye en la proyección
- Posibilidad de editar/eliminar

**RF-016**: Margen para contingencias
- Calcula: Proyección de ingresos - Proyección de egresos
- Muestra: Saldo libre estimado (con confianza %)
- Si hay riesgo de liquidez: alerta

**RF-017**: Análisis de disponibilidad para reinversión
- Saldo libre que se puede usar para inversión/capex
- Diferencia entre "obligatorio" vs "discrecional"
- Recomendación: "Hay $X disponibles, pero considera contingencias"

---

#### 2.3.2 Requisitos Técnicos

**RT-009**: Modelo de datos

```
Forecast:
  - id (UUID)
  - periodo_inicio (String: YYYY-MM)
  - periodo_fin (String: YYYY-MM)
  - tipo (Enum: Automático, Manual)
  - ingresos_proyectados (Decimal)
  - egresos_proyectados (Decimal)
  - saldo_neto (Decimal)
  - confianza_porcentaje (Float 0-100)
  - notas (String)
  - created_at (Timestamp)

OblacionPuntual:
  - id (UUID)
  - concepto (String)
  - monto (Decimal)
  - periodo_esperado (String: YYYY-MM)
  - tipo (Enum: Ingreso, Egreso)
  - prioridad (Enum: Crítica, Alta, Normal, Baja)
```

**RT-010**: Algoritmo de forecasting

```
Para cada próxima mes (0 a 3 meses):
  1. Proyectar ingresos:
     a. Extraer ingresos recurrentes del histórico
     b. Aplicar estacionalidad si aplica
     c. Ajustar por inflación/tendencia (opcional)
  2. Proyectar egresos:
     a. Extraer gastos recurrentes del histórico
     b. Aplicar estacionalidad si aplica
     c. Incluir obligaciones puntuales del usuario
  3. Calcular confianza:
     a. Si hay >3 meses histórico: confianza = 85%
     b. Si hay ajustes manuales: confianza = 70%
     c. Si hay estacionalidad detectada: confianza -= 10%
  4. Retornar: { ingresos_proyectados, egresos_proyectados, saldo_neto, confianza }
```

**RT-011**: API Endpoints

```
GET /api/forecast?meses=3
  Output: [ { periodo, ingresos_proyectados, egresos_proyectados, saldo_neto, confianza } ]
  
POST /api/forecast/obligacion
  Input: { concepto, monto, periodo, tipo, prioridad }
  Output: { id, created_at }
  
GET /api/forecast/disponibilidad?meses=3
  Output: { saldo_total_disponible, margen_contingencia_recomendado, disponible_reinversion }
```

**RT-012**: Testing
- Mínimo 20 tests para proyección automática
- Mínimo 10 tests para estacionalidad
- Cobertura >80%

---

### **BN-004: API REST Contratos**

#### 2.4.1 Contratos de API

```yaml
POST /api/import
  Description: Subir y procesar extracto bancario
  Input:
    file: MultipartFile (Excel/CSV)
    overwrite: boolean (opcional, default: false)
  Response (200):
    {
      "batch_id": "uuid",
      "total_movimientos": 150,
      "procesados": 145,
      "fallidos": 5,
      "errores": [
        { "fila": 3, "razon": "fecha inválida" }
      ]
    }
  Errors:
    400: Archivo no válido
    413: Archivo muy grande (>50MB)

GET /api/movements
  Query Params:
    period: "YYYY-MM" (opcional)
    categoria_id: int (opcional)
    skip: int (default: 0)
    limit: int (default: 100, max: 1000)
  Response (200):
    {
      "total": 500,
      "items": [
        {
          "id": "uuid",
          "fecha": "2024-01-15",
          "descripcion": "TRANSFERENCIA OSPACA",
          "monto": 50000.00,
          "tipo": "Ingreso",
          "categoria": "Ingresos",
          "subcategoria": "Obra Social",
          "confianza_porcentaje": 99,
          "metadata_extraida": {
            "cuit": "12-34567890-1",
            "beneficiario": "OSPACA"
          }
        }
      ]
    }

GET /api/insights
  Query Params:
    period: "YYYY-MM" (optional)
  Response (200):
    {
      "periodo": "2024-03",
      "insights": [
        {
          "tipo": "Patrón",
          "concepto": "OSPACA",
          "valor": 100000.00,
          "contexto": "Paga 2x este mes por desfasaje de calendario",
          "score_importancia": 45,
          "recomendacion": "Normal, no es cambio estructural"
        }
      ]
    }

GET /api/forecast
  Query Params:
    meses: int (1-3, default: 3)
  Response (200):
    {
      "proyecciones": [
        {
          "periodo": "2024-04",
          "ingresos_proyectados": 250000.00,
          "egresos_proyectados": 180000.00,
          "saldo_neto": 70000.00,
          "confianza_porcentaje": 85
        }
      ]
    }

GET /api/reports/pl
  Query Params:
    period: "YYYY-MM"
    include_subcategorias: boolean (default: true)
  Response (200):
    {
      "periodo": "2024-03",
      "ingresos": {
        "total": 250000.00,
        "categorias": [
          {
            "nombre": "Obra Social",
            "total": 100000.00,
            "subcategorias": [
              {
                "nombre": "OSPACA",
                "total": 100000.00,
                "movimientos": [ ... ]
              }
            ]
          }
        ]
      },
      "egresos": { ... }
    }

GET /api/analytics/categorias
  Response (200):
    {
      "ingresos": [
        { "categoria": "Obra Social", "porcentaje": 40, "monto": 100000 }
      ],
      "egresos": [
        { "categoria": "Servicios", "porcentaje": 25, "monto": 45000 }
      ]
    }
```

---

### **BN-005 a BN-008: Frontend (Next.js)**

#### 2.5.1 Requisitos de UI/UX

**RF-018**: Dashboard principal
- Bento Grid con widgets:
  - Upload de extracto (Drag & Drop)
  - KPI cards: Ingresos este mes, Egresos, Saldo
  - Últimas transacciones (vista rápida)
  - Alerta: "Forecasting indica riesgo de liquidez"

**RF-019**: Módulo Reportes
- Tabla jerárquica expandible
- Filtros: período, categoría
- Acciones: ver detalles, descargar PDF/Excel
- Comparativa mes a mes

**RF-020**: Módulo Analytics
- Gráfico de flujo diario (línea)
- Torta de ingresos/egresos por categoría
- Top 10 "hormigas"
- KPIs de salud

**RF-021**: Módulo Insights
- Cards con insights clave ordenados por importancia
- Contexto de cada insight (por qué es importante)
- Recomendaciones accionables

**RF-022**: Navigation & Responsividad
- Sidebar con navegación entre módulos
- Responsive: Desktop (prioridad), Tablet
- Dark mode: Kit de marca TORO
- Periodo selector global (dropdown Mes/Año)

---

#### 2.5.2 Requisitos Técnicos (Frontend)

**RT-013**: Arquitectura de componentes

```
App
├── Navbar (sidebar, logo, periodo selector)
├── Router
│   ├── /dashboard
│   │   ├── BentoGrid
│   │   ├── UploadWidget
│   │   └── RecentTransactions
│   ├── /reportes
│   │   └── DesgloseJerarquico
│   ├── /analytics
│   │   ├── FlowChart
│   │   ├── CategoriesChart
│   │   └── KPIsCard
│   ├── /insights
│   │   └── InsightsCards
│   └── /configuracion
│       ├── CategoriesManager
│       └── RulesEditor
```

**RT-014**: State Management

```
Hooks:
- usePeriod(): Período global (context)
- useFinancialData(): Fetch + cache de movimientos
- useInsights(): Fetch de insights
- useForecast(): Fetch de forecast
- useUpload(): Upload y progress tracking
```

**RT-015**: HTTP Client

```
// services/api.ts
export const api = {
  importExtract: (file) => POST /api/import,
  getMovements: (period, filters) => GET /api/movements,
  getInsights: (period) => GET /api/insights,
  getForecast: (meses) => GET /api/forecast,
  getReportPL: (period) => GET /api/reports/pl,
  getAnalytics: () => GET /api/analytics/categorias,
}
```

**RT-016**: Testing Frontend
- Mínimo 20 tests para componentes críticos (Dashboard, Reportes)
- Cobertura >70%
- Testing library + Vitest

---

## 3. Requisitos No-Funcionales

### Rendimiento
- API responde en <500ms (movimientos, insights)
- Dashboard renderiza en <2s
- Upload de 1000 movimientos procesa en <5s

### Escalabilidad
- Soporta hasta 100.000 movimientos en la DB (local)
- Sin degración notoria de rendimiento

### Mantenibilidad
- Código sin hardcoding (todos los valores en config/DB)
- Funciones pequeñas, testables, reutilizables
- Documentación de APIs (OpenAPI)

### Seguridad
- Single-user: no hay auth en v1
- SQLite local: datos en la máquina del usuario
- No hay llamadas a servicios externos

---

## 4. Criterios de Aceptación

### Por Bloque Negativo

**BN-001**: Categorización >99% confianza en 95% de casos
- "Normal" = categoría clara (OSPACA, Servicios, etc.)
- "Difícil" = ambiguo, cae en "Otros"

**BN-002**: Insights detectan correctamente contexto de timing
- Prueba: "OSPACA pagó 2x el mes X" → sistema debe decir "no es cambio real"

**BN-003**: Forecast con confianza >80% para próximo mes
- Mejora con más histórico (3+ meses)

**BN-004**: API documentada, todos los endpoints testeados

**BN-005 a BN-008**: UI funcional, responsive, integrada con backend

---

## 5. Timeline de Hitos (Etapas, No Deadlines)

| Etapa | Descripción | Condición de salida |
|:---|:---|:---|
| E1 | BN-001: Parser + Categorización | >95% movimientos categorizados correctamente |
| E2 | BN-002: Motor de Insights | Insights detectan patrones y anomalías |
| E3 | BN-003: Forecasting | Forecast con confianza >80% |
| E4 | BN-004: API completa | Todos los endpoints documentados y testeados |
| E5 | BN-005: Dashboard base | Layout responsive, componentes base |
| E6 | BN-006, 007: Reportes + Analytics | Tabla jerárquica y gráficos funcionales |
| E7 | BN-008: Integración completa | Aplicación end-to-end funcional |
| E8 | Validación y ajustes | PRD cumplido, listo para uso |

---

## 6. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|:---|:---|:---|:---|
| Categorización imprecisa en casos edge | Media | Alto | Más reglas, ML hints, revisión manual |
| Motor de insights genera falsos positivos | Media | Medio | Testing exhaustivo, threshold tunning |
| Forecasting poco confiable con poco histórico | Alta | Bajo | User feedback, ajustes manuales |
| UI no refleja kit de marca | Baja | Medio | Revisión temprana con usuario |

---

*Versión: 1.0*  
*Aprobación requerida*: Tori (usuario)  
*Estado: En validación*
