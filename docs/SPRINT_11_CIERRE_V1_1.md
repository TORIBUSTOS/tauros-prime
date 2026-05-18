# Sprint 11 - Cierre v1.1 Ejecutivo

Fecha de cierre: 2026-05-18

## Objetivo

Dejar TAUROS v1.1 como sistema financiero presentable: baseline anual visible, insights revisables/exportables, forecast real y guia operativa de carga mensual.

## Resultado

- **Estado**: cerrado.
- **Dashboard ejecutivo**: Snapshot v1.1 integrado en `/`.
- **Resumen ejecutivo API**: `GET /api/executive/summary`.
- **Export de insights aprobados**: `GET /api/insights-engine/export?estado_revision=approved`.
- **Guia mensual**: `docs/GUIA_CARGA_MENSUAL.md`.
- **Baseline operativo**: mayo 2025 - abril 2026.

## Implementacion

### Backend

- Nuevo endpoint `/api/executive/summary`:
  - rango de baseline;
  - cantidad de meses;
  - movimientos totales;
  - duplicados;
  - sin categoria;
  - resumen financiero anual;
  - estados de revision de insights;
  - forecast 3M siguiente al ultimo periodo cargado.
- Nuevo endpoint `/api/insights-engine/export`:
  - export CSV por estado de revision;
  - default: `approved`.

### Frontend

- Nuevo componente `ExecutiveSnapshot`.
- Integracion en Dashboard principal.
- CTA de exportacion de insights aprobados.
- Tipos y cliente API para resumen ejecutivo.

### Documentacion

- Cierre SP11.
- Guia operativa mensual.
- Roadmap actualizado a v1.1 cerrado.

## Validaciones

- Backend rutas + forecast: `42 passed`.
- Frontend API + dashboard: `28 passed`.
- Frontend build: OK.
- Backend reiniciado y health OK.
- Endpoint forecast SP10 validado tras reinicio.

## Estado v1.1

TAUROS queda listo como sistema operativo financiero local para:

- importar extractos;
- categorizar y auditar decisiones;
- generar Canon de Insights;
- revisar candidatos humanos;
- proyectar flujo 3M con baseline anual;
- exportar insights aprobados;
- sostener carga mensual con guia operativa.

## Proximo Ciclo Sugerido

**SP12 - Conversion guiada de insights a reglas**

- Cuando un candidato se marque `converted_to_rule`, abrir formulario guiado.
- Conectar candidato con regla cascada o regla de insights.
- Mostrar historial por candidato.
