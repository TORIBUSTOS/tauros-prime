# PROJECT_CONTEXT.md — Contexto de TORO_Prime (TAUROS v2)

## Objetivos del Proyecto
TORO_Prime es la evolución de TAUROS. Su misión es transformar la data bancaria en **Insights Estratégicos** para TORO Holding.

### Foco Principal
- Ingesta y categorización con >99% de precisión.
- Motor de detección de patrones y anomalías financieras.
- Forecasting de flujo de caja a 3 meses.
- Visualización premium (Bento Grid, Charts dinámicos).

## Estado Actual
- **Fase**: SP5 cerrado; preparacion de SP6 para baseline anual.
- **Protocolo**: TORO LAB v2 (Gates + Bloques Negros).
- **Tracks**: Backend/API, Frontend/UX e Insights Engine configurable.
- **Datos reales cargados**: noviembre 2025 a abril 2026.
- **Volumen actual**: 2.948 movimientos.
- **Duplicados exactos**: 0.
- **Sin categoria**: 1 excepcion aceptada manualmente (`DOCUMENTO 27963963144`, marzo 2026).
- **Importacion**: soporta extractos Supervielle crudos y archivos normalizados.
- **Insights**: existe capa nueva de candidatos configurables, aun pendiente de Canon TAUROS real.

## Roadmap Inmediato

### SP6 - Consolidacion 6 meses + expansion a 12 meses
- Validar base Nov 2025 - Abr 2026.
- Subir 3 meses anteriores y resolver categorias.
- Subir 3 meses restantes y cerrar baseline May 2025 - Abr 2026.
- Documentar reglas nuevas y excepciones.

### SP7 - Canon TAUROS de Insights
- Definir KPI vs insight vs alerta vs ruido.
- Cargar entidades estructurales y reglas reales SANARTE.
- Ejecutar candidatos sobre baseline anual.

### SP8 - Bandeja de revision
- UI para aprobar, rechazar, ignorar o convertir insights en regla.
- Bandeja especial de movimientos sin categoria.

### SP9 - Forecast real
- Ajustar forecast con baseline anual.
- Separar estructural vs extraordinario.

### SP10 - v1.1 ejecutivo
- Dashboard y reportes listos para presentacion operativa.

## Stakeholders
- **Director / CFO**: Tori (Responsable de UI/UX y Decisiones de Negocio).
- **Backend / Arquitectura**: Claude / Antigravity (Track A).
- **Frontend / Componentes**: Gemini (Track B).

---
*Última actualización: 2026-05-18*
