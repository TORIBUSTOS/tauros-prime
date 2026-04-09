# DESIGN_SYSTEM.md — Reglas Técnicas v2 (Imperial)

Este documento traduce la estética Romana a tokens técnicos para el desarrollo de componentes.

## 1. Design Tokens (Imperial Palette)

| Token | HSL | Hex | Uso |
|:---|:---|:---|:---|
| `--bg-base` | `hsl(240, 3%, 8%)` | `#131314` | Fondo de aplicación |
| `--bg-void` | `hsl(240, 4%, 6%)` | `#0D0D0E` | Sidebar / Contenedores profundos |
| `--bg-surface` | `hsl(210, 2%, 12%)` | `#1E1F20` | Cards / Inputs |
| `--acc-gold` | `hsl(10, 24%, 66%)` | `#C09891` | Primario / Call to Action |
| `--acc-bronze` | `hsl(15, 27%, 37%)` | `#775144` | Secundario / Bordes activos |
| `--txt-high` | `hsl(8, 48%, 91%)` | `#F4DBD8` | Títulos / Cuerpo principal |
| `--txt-low` | `hsl(4, 15%, 70%)` | `#BEA8A7` | Texto descriptivo / Labels |

## 2. Component Blueprint

### Logo Header
- **Asset**: `toro_romano_main.png`.
- **Dimension**: `48px` altura.
- **Efecto**: Drop shadow sutil `0 4px 20px rgba(0,0,0,0.5)`.

### Grid System
- Usar **Bento Grid** para el Dashboard principal.
- Gaps de `1rem` o `1.5rem`.
- Padding interno de Cards: `1.5rem`.

## 3. Micro-interacciones
- **Buttons**: Hover cambia color a `--acc-bronze` con transición `0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Cards**: Glow perimetral sutil (`rgba(192, 152, 145, 0.05)`) al enfocar.

---
*Referencia: `prd/branding/toro romano.png`*
