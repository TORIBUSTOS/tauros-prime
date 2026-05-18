# Implementacion P2 - Auditoria Visual TAUROS Sprint 5

Fecha: 2026-05-17

## Alcance

Correcciones P2 aplicadas sobre jerarquia, densidad y claridad operativa en Analytics, Categorias y Reportes.

## Cambios aplicados

### Analytics

- Se compacto el layout general para reducir saturacion del primer viewport.
- La tarjeta de distribucion separa el donut de la lista de categorias, evitando que la leyenda quede cortada.
- El burn rate diario se muestra sin centavos para mejorar lectura escaneable.
- El header resume confianza y score sin crear otro modulo grande.

Evidencia visual: `screens/after-p2/analytics.png`

### Categorias

- Se agrego una franja resumen con ingresos clasificados, gastos clasificados y reglas activas.
- El resumen de categorias paso a formato comparativo por columnas: categoria, impacto, movimientos, reglas y subcategorias.
- Se subio contraste de metricas clave y se redujo repeticion visual en cada fila.

Evidencia visual: `screens/after-p2/categorias.png`

### Reportes

- El boton de exportacion ahora explicita que descarga el CSV P&L completo.
- La instruccion de interaccion se volvio visible y accionable.
- Se ocultan variaciones `0%` para evitar ruido visual en filas sin cambio real.
- El CSV escapa valores para evitar archivos rotos si aparece una coma o comilla en nombres.

Evidencia visual: `screens/after-p2/reportes.png`

## Verificacion ejecutada

- `npm run test:run -- analytics/page.test.tsx categorias/page.test.tsx reportes/page.test.tsx` -> 21 tests passing.
- `npm run build` -> build OK.
- Capturas Playwright desktop `1920x1080`:
  - `screens/after-p2/analytics.png`
  - `screens/after-p2/categorias.png`
  - `screens/after-p2/reportes.png`

## Pendiente sugerido

- Revisar responsive mobile de tablas largas si estas pantallas se usaran fuera de desktop.
- Rehacer laminas anotadas comparativas solo si se quiere documentar antes/despues para decision ejecutiva.
