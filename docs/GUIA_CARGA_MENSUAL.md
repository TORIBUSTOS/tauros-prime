# Guia Operativa - Carga Mensual TAUROS

## Objetivo

Mantener TAUROS actualizado mes a mes sin romper el baseline anual ni contaminar el Canon de Insights.

## Flujo Recomendado

1. Exportar extracto Supervielle del mes cerrado.
2. Subir el `.xlsx` desde el Dashboard.
3. Verificar cantidad de movimientos importados.
4. Revisar `/categorias` para resolver movimientos sin categoria.
5. Ejecutar recategorizacion global si se agregaron reglas nuevas.
6. Revisar `/auditoria`:
   - candidatos de insights pendientes;
   - movimientos sin categoria;
   - historial de cambios.
7. Revisar `/analytics`:
   - forecast 3M;
   - componente estructural;
   - componente extraordinario.
8. Exportar insights aprobados desde el Snapshot Ejecutivo.

## Criterios de Aceptacion Mensual

- Duplicados exactos: 0.
- Movimientos sin categoria: 0, salvo excepcion conscientemente aceptada.
- Reglas nuevas documentadas por auditoria.
- Insights pendientes revisados o justificados.
- Forecast 3M actualizado con el nuevo mes en baseline.

## Reglas Practicas

- No crear regla por un movimiento si no hay criterio repetible.
- Si el movimiento es esperado y estructural, clasificarlo como KPI/baseline, no insight.
- Si hay duda real, dejarlo pendiente y documentar decision humana.
- No modificar el motor para casos SANARTE: ajustar `config/insight_rules.json` o reglas cascada.

## Entregables Por Mes

- Mes importado.
- Categorias limpias.
- Reporte ejecutivo revisado.
- Insights aprobados exportados si aplica.
- Nota de excepciones si quedan pendientes.
