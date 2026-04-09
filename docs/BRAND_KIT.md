# BRAND_KIT.md — Identidad Visual de TAUROS (v2 Imperial)

> [!IMPORTANT]
> Este documento ha sido actualizado tras la integración de los activos oficiales de `prd/branding`. Sustituye a la versión "Teal" anterior.

## Concepto
**"Roman Imperial meets Gemini Dark"**: Una fusión entre la profundidad tecnológica del modo oscuro de Gemini y la autoridad clásica/atemporal del Imperio Romano (Oro, Bronce, Piedra).

## 1. Paleta de Colores (Oficial)

| Nombre Variable | Hex Code | Uso Sugerido | Origen |
|:---|:---|:---|:---|
| `--color-bg-base` | `#131314` | Fondo base absoluto (Pure Gemini Dark). | Usuario |
| `--color-bg-void` | `#0D0D0E` | Profundidad extrema, Sidebars y Footers. | Usuario |
| `--color-bg-surface` | `#1E1F20` | Tarjetas, modales y botones. | Usuario |
| `--color-accent-gold` | `#C09891` | Acento principal (Oro Molienda / Taupe). | `branding` |
| `--color-accent-bronze`| `#775144` | Acento secundario, estados de hover. | `branding` |
| `--color-text-high`   | `#F4DBD8` | Texto principal (Crema Imperial). | `branding` |
| `--color-text-low`    | `#BEA8A7` | Texto secundario y etiquetas. | `branding` |

## 2. Tipografía

- **Primaria**: `Outfit` (Google Fonts). Elegante, moderna y con geometría impecable.
- **Secundaria**: `Montserrat` (Google Fonts). Para cuerpos de texto densos.

## 3. Simbolología Oficial
- **Isotipo**: `toro_romano_main.png`. Un buey laureado entre columnas romanas.
- **Iconografía**: Lineal, peso 1.5, usando `--color-accent-gold` para resaltar acciones clave.

## 4. Estética de Componentes
- **Bordes**: `12px` (Cards), `1px solid rgba(192, 152, 145, 0.1)`. 
- **Sombras**: Resplandor externo sutil en color Oro para elementos activos.
- **Gradientes**: Mínimos, solo para texturas de superficie `linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-base))`.

---
*Versión: 2.0 (Roman Imperial)*
