# ARQUITECTURA.md — Arquitectura del Sistema
> Este documento refleja el estado REAL del código, no el estado deseado.  
> Se actualiza cada vez que la estructura cambia — antes de mergear el cambio, no después.  
> Responsable: Claude (CTO)

---

## VISIÓN GENERAL

`[COMPLETAR — descripción en 3-5 líneas de cómo funciona el sistema a alto nivel]`

---

## DIAGRAMA DE COMPONENTES

```
[COMPLETAR — diagrama ASCII del sistema]

Ejemplo:

┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│         React / Next.js / TailwindCSS       │
└──────────────────┬──────────────────────────┘
                   │ HTTP / REST
┌──────────────────▼──────────────────────────┐
│                   API                       │
│              FastAPI / Node.js              │
├─────────────────────────────────────────────┤
│              SERVICIOS                      │
│    auth-service  │  data-service  │  ...   │
└──────┬───────────┴────────┬────────────────-┘
       │                    │
┌──────▼──────┐    ┌────────▼────────┐
│   Base de   │    │   Servicios     │
│    datos    │    │   externos      │
│  SQL Server │    │   (APIs, MCP)   │
└─────────────┘    └─────────────────┘
```

---

## ESTRUCTURA DE CARPETAS

```
[COMPLETAR — árbol real del repo al momento de esta versión]

Ejemplo:

proyecto/
├── CLAUDE.md
├── ANTIGRAVITY.md
├── .agents/
│   ├── claude.md
│   └── gemini.md
├── docs/
│   ├── ARQUITECTURA.md       ← este archivo
│   ├── CHANGELOG.md
│   ├── CONTRATOS_API.md
│   ├── DECISIONES.md
│   ├── LEYES_DE_CODIGO.md
│   ├── PROJECT_CONTEXT.md
│   └── TECNOLOGIAS.md
├── src/
│   ├── api/
│   ├── services/
│   ├── models/
│   └── components/
├── config/
│   └── [archivos de configuración — sin valores sensibles]
├── mocks/
│   └── [datos de desarrollo]
└── tests/
```

---

## COMPONENTES PRINCIPALES

### [NOMBRE DEL COMPONENTE]

**Responsabilidad:** `[qué hace este componente — una sola cosa]`  
**Track:** `A — Backend / B — Frontend`  
**BN de origen:** `BN-[número]`  
**Agente responsable:** `Claude / Gemini`  
**Archivos principales:** `[lista de archivos]`  
**Dependencias internas:** `[otros componentes que usa]`  
**Expone:** `[qué interfaz o función ofrece al resto del sistema]`

---

## FLUJOS PRINCIPALES

### Flujo: [NOMBRE DEL FLUJO]

```
[COMPLETAR — descripción del flujo paso a paso]

Ejemplo:

1. Usuario ingresa datos en el formulario (Frontend)
2. Frontend llama a POST /api/[endpoint] con los datos
3. API valida el input contra el contrato
4. Servicio de negocio procesa la lógica
5. Se persiste en la base de datos
6. API devuelve respuesta al Frontend
7. Frontend actualiza la UI
```

---

## DECISIONES ARQUITECTÓNICAS CLAVE

> Resumen ejecutivo. El detalle completo vive en `docs/DECISIONES.md`.

| Decisión | Razón | ADR |
|----------|-------|-----|
| `[COMPLETAR]` | `[COMPLETAR]` | ADR-[número] |

---

## PUNTOS DE INTEGRACIÓN EXTERNOS

| Sistema | Tipo | Dirección | Contrato |
|---------|------|-----------|---------|
| `[COMPLETAR]` | `API / DB / Archivo` | `Entrada / Salida / Bidireccional` | `Ver CONTRATOS_API.md` |

---

## LO QUE ESTE SISTEMA NO ES

> Scope negativo arquitectónico. Evita malentendidos sobre qué hace el sistema.

- `[COMPLETAR]`
- `[COMPLETAR]`

---

## HISTORIAL DE CAMBIOS ARQUITECTÓNICOS

| Versión | Fecha | Qué cambió | ADR |
|---------|-------|-----------|-----|
| v0.1.0 | `[COMPLETAR]` | Arquitectura inicial | ADR-001 |

---

*Última actualización: `[COMPLETAR]`*  
*Si el código y este documento no coinciden, el código está mal o este documento está desactualizado. Resolver antes de continuar.*
