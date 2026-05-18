# Roadmap TAUROS - Mayo 2026

Estado de partida actualizado: Sprint 7 cerrado, mayo 2025 a abril 2026 cargado, 6.172 movimientos, duplicados exactos en 0 y una sola excepcion sin categoria aceptada manualmente.

## SP6 - Consolidacion 6 Meses + Expansion a 9 Meses

Objetivo: consolidar la base actual y extender el baseline hasta Ago 2025 - Abr 2026.

Estado: cerrado.

### Bloque A - Base actual

- Validar Nov 2025 - Abr 2026.
- Confirmar duplicados exactos en 0.
- Confirmar que solo queda `DOCUMENTO 27963963144` como sin categoria aceptado.
- Consolidar reglas nuevas de noviembre/diciembre.
- Documentar categorias y excepciones.

### Bloque B - Subir 3 meses anteriores

- Cargar Ago/Sep/Oct 2025.
- Verificar importacion.
- Revisar duplicados.
- Resolver sin categoria.
- Ajustar reglas nuevas.

## SP7 - Expansion a 12 Meses

Objetivo: completar el año operativo en un sprint separado.

Estado: cerrado.

- Cargar May/Jun/Jul 2025.
- Verificar importacion.
- Revisar duplicados.
- Resolver sin categoria.
- Cerrar baseline May 2025 - Abr 2026.

Resultado: baseline anual cerrado con 6.172 movimientos, 0 duplicados exactos y May/Jun/Jul 2025 sin pendientes de categoria.

## SP8 - Canon TAUROS de Insights

Objetivo: definir insights reales para SANARTE sobre base anual.

Estado: cerrado.

- Separar KPI, alerta, insight, anomalia, ruido y revision manual.
- Definir entidades estructurales: OSPACA, SANARTE, sueldos, AFIP, Visa, alquileres y proveedores recurrentes.
- Ajustar `config/insight_rules.json`.
- Ejecutar candidatos con `/api/insights-engine/evaluate`.
- Validar que no se generen obviedades tipo "mayor ingreso del mes".

Resultado: Canon inicial cargado, 160 candidatos persistidos, 24 pendientes humanos y 136 KPI/baseline ignorados automaticamente.

## SP9 - Bandeja de Revision

Objetivo: incorporar flujo humano para validar candidatos.

Estado: proximo.

- UI para `pending`, `approved`, `rejected`, `ignored`, `converted_to_rule`.
- Bandeja de movimientos sin categoria.
- Accion convertir candidato/movimiento en regla.
- Trazabilidad en auditoria.

## SP10 - Forecast Real

Objetivo: mejorar proyecciones con baseline anual.

- Separar gastos estructurales y extraordinarios.
- Detectar pendientes recurrentes.
- Comparar forecast anterior vs nuevo.
- Generar proyeccion Mayo/Junio/Julio.

## SP11 - Cierre v1.1 Ejecutivo

Objetivo: dejar TAUROS como sistema operativo financiero presentable.

- Dashboard ejecutivo con baseline anual.
- Reporte mensual comparativo.
- Export de insights aprobados.
- Guia operativa de carga mensual.
