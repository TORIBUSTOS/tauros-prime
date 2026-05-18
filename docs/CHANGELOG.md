# CHANGELOG.md — TAUROS v2

## [0.1.0] — 2026-04-09
### Added
- Inicialización del repositorio y estructura base.
- Documentación inicial y configuración de entorno.

## [0.2.0] — 2026-04-09
### Added
- Integración Full-Stack: Conexión del frontend con FastAPI.
- Reportes P&L con navegación jerárquica.
- Servicio de categorización automática de movimientos.
- Sistema de selección de períodos global.

## [0.3.0] — 2026-04-10
### Added
- **Predictive Analytics**: Implementación de `ForecastChart` con 3 escenarios (Optimista, Realista, Pesimista).
- **UX Polish**: Barra de navegación móvil (Bottom Nav) y Sidebar con animaciones `framer-motion`.
- **Global Toast System**: Notificaciones animadas de éxito, error e info.
- **Drill-down de Micro-gastos**: Vista detallada de transacciones en Análisis Hormiga.

### Improved
- Responsividad de gráficos en dispositivos móviles.
- Jerarquía visual del Dashboard (Bento Grid).

## [0.6.0] — 2026-05-18
### Added
- Base real ampliada a noviembre 2025 - abril 2026: 2.948 movimientos.
- Insights Engine configurable con reglas externas en `config/insight_rules.json`.
- Tabla `insight_candidates` con estados de revision.
- Auditoria visual Sprint 5 con capturas raw/anotadas y QA responsive.
- Roadmap SP6-SP10 para baseline anual, Canon TAUROS de Insights y v1.1 ejecutivo.

### Improved
- Parser de importacion acepta extractos Supervielle crudos (`Fecha`, `Concepto`, `Detalle`, `Debito`, `Credito`, `Saldo`).
- Interpretacion de fechas argentinas con `dayfirst=True`.
- Dashboard, Movimientos, Categorias, Reportes, Analytics, Insights y Auditoria refinados en Sprint 5.
- Reglas de categorizacion ajustadas para noviembre/diciembre; solo queda 1 movimiento sin categoria aceptado manualmente.

## [0.7.0] — 2026-05-18
### Added
- Sprint 6 cerrado con base Ago 2025 - Abr 2026.
- Total operativo ampliado a 4.407 movimientos.
- Documento de cierre `docs/SPRINT_6_CONSOLIDACION.md`.

### Improved
- Reglas de categorizacion SP6 para financiacion, FCI, cuotas afiliados, honorarios, juicios, extracapita, IIBB Cordoba y comisiones.
- Ago/Sep/Oct 2025 quedan con 0 movimientos sin categoria.

## [0.8.0] — 2026-05-18
### Added
- Sprint 7 cerrado con baseline anual May 2025 - Abr 2026.
- Total operativo ampliado a 6.172 movimientos.
- Documento de cierre `docs/SPRINT_7_CONSOLIDACION.md`.

### Improved
- May/Jun/Jul 2025 quedan con 0 movimientos sin categoria.
- La carga oficial de junio/julio se valido contra deduplicacion sin duplicar movimientos.
- Reglas de categorizacion SP7 para juicios, honorarios abogado laboral, cuotas afiliados, sueldo dev SANARTE, devoluciones, IVA y comisiones de cheques.

## [0.9.0] — 2026-05-18
### Added
- Sprint 8 cerrado con Canon TAUROS inicial de Insights.
- Documento de cierre `docs/SPRINT_8_CANON_INSIGHTS.md`.
- Configuracion de entidades estructurales, fuentes excluidas y variaciones por categoría/subcategoría en `config/insight_rules.json`.

### Improved
- `income_dependency` permite excluir fuentes no operativas desde configuracion.
- `category_variation` soporta agrupacion `category_subcategory`, `excluded_labels` y `min_abs_delta`.
- Matching de entidades configuradas exacto tras normalizacion para evitar falsos positivos.
- Baseline anual evaluado: 160 candidatos persistidos, 24 pendientes humanos y 136 KPI/baseline ignorados.

## [0.10.0] — 2026-05-18
### Added
- Sprint 9 cerrado con bandeja de revision de insights en `/auditoria`.
- Componente `InsightReviewQueue` para revisar candidatos `pending`, `approved`, `rejected`, `ignored` y `converted_to_rule`.
- Clientes frontend para candidatos de insights, cambios de estado y bandeja de movimientos sin categoria.
- Documento de cierre `docs/SPRINT_9_BANDEJA_REVISION.md`.

### Improved
- Cambios de estado de candidatos ahora generan `audit_logs` con accion `revision_insight`.
- `/auditoria` concentra revision humana de insights y el historial cronologico del motor.

## [0.11.0] — 2026-05-18
### Added
- Sprint 10 cerrado con Forecast Real sobre baseline anual.
- Documento de cierre `docs/SPRINT_10_FORECAST_REAL.md`.
- Metadata de forecast por item: clase, meses activos, baseline, variabilidad, metodo y dia sugerido.

### Improved
- `ForecastService` usa solo historico anterior al periodo proyectado.
- Proyecciones por categoria/subcategoria.
- Escenario realista separa `structural_3m` y `extraordinary_3m`.
- `ForecastChart` muestra resumen 3M realista, estructural y extraordinario.
