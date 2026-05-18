# Sprint 10 - Forecast Real

Fecha de cierre: 2026-05-18

## Objetivo

Mejorar el motor de proyecciones usando el baseline anual completo y separar el flujo esperado entre componentes estructurales, estacionales/manuales y extraordinarios.

## Resultado

- **Estado**: cerrado.
- **Motor actualizado**: `backend/src/services/forecast.py`.
- **Baseline**: 12 meses anteriores al periodo proyectado, sin usar movimientos del mes objetivo.
- **Horizonte**: 3 meses.
- **Clasificacion por item**:
  - `structural`
  - `seasonal`
  - `manual`
  - `extraordinary`
- **UI actualizada**: `ForecastChart` muestra total realista 3M, componente estructural y componente extraordinario.

## Cambios Implementados

### Backend

- El forecast ya no filtra datos futuros ni del mismo mes proyectado como historico.
- Cada item se calcula por categoria/subcategoria.
- Se usa promedio mensual ponderado con mayor peso para meses recientes.
- Se detecta estacionalidad por mismo mes historico cuando existe.
- Se clasifican items de forecast segun recurrencia y variabilidad.
- Las obligaciones manuales pendientes se integran como clase `manual`.
- Los escenarios mantienen compatibilidad (`realistic`, `optimistic`, `pessimistic`) y agregan:
  - `structural_3m`
  - `extraordinary_3m`

### Contratos

- `ForecastItemResponse` expone:
  - `std_dev`
  - `metadata`
- `ForecastResponse` expone:
  - `metadata`

### Frontend

- `ForecastChart` muestra chips de resumen:
  - 3M realista
  - estructural
  - extraordinario
- Tooltip enriquecido con desglose estructural/extraordinario.
- Tipos TypeScript actualizados para metadata del forecast.

## Validacion Real

Forecast desde `2026-05` sobre baseline May 2025 - Abr 2026:

- Baseline usado: 12 meses.
- Meses proyectados:
  - `2026-05`
  - `2026-06`
  - `2026-07`
- Total realista 3M: `$36.069.427,03`.
- Componente estructural 3M: `$22.999.383,37`.
- Componente extraordinario 3M: `$13.070.043,66`.

## Validaciones Ejecutadas

- Forecast + rutas: `59 passed`.
- Frontend build: OK.

## Pendiente Para SP11

- Convertir el forecast en reporte ejecutivo exportable.
- Mostrar top drivers del forecast por categoria/subcategoria.
- Validar visualmente la pagina de Analytics con el usuario.
- Cerrar v1.1 ejecutivo con dashboard, reportes e insights aprobables.
