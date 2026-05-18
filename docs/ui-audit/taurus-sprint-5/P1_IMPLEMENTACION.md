# Implementacion P1 - Auditoria Visual TAUROS Sprint 5

Fecha: 2026-05-17

## Alcance

Correcciones aplicadas sobre hallazgos P1 visibles en la auditoria visual. No se cambio la identidad visual ni la arquitectura general de UI.

## Cambios aplicados

### Dashboard

- Se removio el panel Cortex Hub del primer viewport mientras CORTEX queda fuera del alcance operativo.
- Los KPIs financieros ya no cortan importes con ellipsis.
- Se simplifico la carga inicial del dashboard para evitar requests analiticos no visibles.

Evidencia visual: `screens/after-p1/dashboard.png`

### Insights

- La salud financiera ahora se calcula contra el periodo seleccionado.
- Cuando no hay base de datos suficiente, la UI muestra `Sin datos` en lugar de valores falsos como `$0` o `0%`.
- El endpoint `/api/insights/salud` acepta `period=YYYY-MM`.

Evidencia visual: `screens/after-p1/insights.png`

### Movimientos

- Cada fila permite abrir una vista de detalle para leer la descripcion completa del movimiento.
- Se mantiene la tabla compacta para escaneo rapido, pero sin perder trazabilidad.

Evidencia visual: `screens/after-p1/movimientos.png`

### Auditoria

- El estado sin logs ahora comunica que no hay movimientos de auditoria y ofrece una accion clara para actualizar.
- Se evita mostrar una tabla vacia cuando no hay datos.

Evidencia visual: `screens/after-p1/auditoria.png`

### Capturas locales

- Se desactivo `devIndicators` en Next para que el indicador de desarrollo no contamine capturas de auditoria visual.

## Verificacion ejecutada

- Frontend: `npm run test:run` -> 223 tests passing.
- Frontend: `npm run build` -> build OK.
- Backend: `python -m pytest -q` -> 89 tests passing.
- Visual: revision de capturas `dashboard`, `insights`, `movimientos` y `auditoria` en `screens/after-p1/`.

## Pendiente para P2

- Mejorar densidad y jerarquia en Analytics.
- Refinar Categorias para comparacion mas rapida de metricas.
- Aclarar exportacion y porcentajes en Reportes.
- Rehacer laminas anotadas si se quiere comparar antes/despues formalmente.
