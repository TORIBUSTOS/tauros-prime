# Frontend CLAUDE.md — TAUROS v2

## Quick Start
```bash
cd frontend
npm install
npm run dev        # http://localhost:7000
npm run test:run   # Vitest + RTL
npm run build      # Verifica tipos + build prod
```

## Stack
- Next.js 14 App Router · React 18 · TypeScript
- **Tailwind v4** con `@theme inline` en `globals.css` — NO usar `tailwind.config.js`
- CSS Variables imperiales en `src/styles/themes.css`
- API base: `http://localhost:9000/api` (FastAPI)

## Tailwind v4 — Gotcha crítico
Para que `text-imperial-bronze` funcione, el color DEBE estar en `@theme inline` en `globals.css`:
```css
@theme inline {
  --color-imperial-bronze: var(--imperial-bronze);
}
```
Sin eso, la clase se genera vacía (no error, sólo ausencia de estilo). Ver `src/app/globals.css`.

## Colores semánticos
- `text-success` = verde (ingresos) · `text-error` = rojo (egresos)
- **NO sobreescribir `color` en `.metric-value`** en `themes.css` — eso pisaba los colores semánticos (bug resuelto 2026-04-09)

## Páginas (App Router)
| Ruta | Archivo | Estado |
|---|---|---|
| `/` | `app/page.tsx` | Dashboard principal |
| `/movimientos` | `app/movimientos/page.tsx` | Tabla filtrable |
| `/categorias` | `app/categorias/page.tsx` | CRUD motor cascada + drill-down subcategorías |
| `/analytics` | `app/analytics/page.tsx` | Charts FlowChart + Pie |
| `/insights` | `app/insights/page.tsx` | Cards CortexHub (deduplicadas por tipo:categoría) |
| `/reportes` | `app/reportes/page.tsx` | P&L jerárquico |

## Componentes clave
- `components/dashboard/` — MetricCards, TopCategorias, CortexHub, InsightCard
- `components/shared/BaseCard, LoadingImperial` — base para todo
- `context/PeriodContext` — período global seleccionado (fuente de verdad para todas las páginas)
- `context/ToastContext` — notificaciones globales
- `context/ThemeContext` — dual-theme (Finance-First / Premium Glass)
- `services/api.service.ts` — todos los fetch al backend
- `types/api.ts` — interfaces TypeScript que espejean los schemas Pydantic del backend

## Agregar nueva página
1. Crear `src/app/<nombre>/page.tsx` con `'use client'`
2. Usar `usePeriod()` para el período activo
3. Agregar al nav en `src/app/layout.tsx` (array `navItems` + mobile nav)
