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
