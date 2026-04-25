# CONTRATOS_API.md — Contratos de Integración
> Guardián: Claude (CTO)  
> Este documento es ley entre tracks. Ningún agente modifica un contrato sin aprobación de Claude.  
> Si Gemini necesita cambiar algo de este documento, pausa y escala antes de tocar código.

---

## ESTADO DE CONTRATOS

| Contrato | Track A (Backend) | Track B (Frontend) | Estado |
|----------|------------------|--------------------|--------|
| `[COMPLETAR]` | ✓ Implementado / ⏳ Pendiente | ✓ Consumido / ⏳ Pendiente | 🟢 Activo |

---

## FORMATO DE CONTRATO

Cada endpoint o interfaz tiene su bloque. Copiar y completar por cada uno.

---

### [NOMBRE DEL ENDPOINT O INTERFAZ]

**Tipo:** `REST / WebSocket / Función interna / Evento`  
**Owner (quien lo implementa):** `Track A — Gemini / Claude`  
**Consumer (quien lo consume):** `Track B — Gemini / Claude`  
**Estado:** `Pendiente / En desarrollo / Activo / Deprecado`  
**Versión:** `v1`

**Endpoint:**
```
[MÉTODO] /[ruta]
```

**Headers requeridos:**
```
Content-Type: application/json
Authorization: Bearer [token]
[otros headers]
```

**Input — Request Body:**
```json
{
  "campo": "tipo — descripción",
  "campo_opcional?": "tipo — descripción"
}
```

**Output — Response exitosa (2xx):**
```json
{
  "campo": "tipo — descripción"
}
```

**Errores posibles:**
| Código | Causa | Body de respuesta |
|--------|-------|------------------|
| `400` | `[descripción]` | `{ "error": "[mensaje]" }` |
| `401` | `[descripción]` | `{ "error": "[mensaje]" }` |
| `500` | `[descripción]` | `{ "error": "[mensaje]" }` |

**Notas / restricciones:**
- `[cualquier regla especial de este contrato]`

**Historial de cambios:**
| Fecha | Versión | Qué cambió | Aprobado por |
|-------|---------|-----------|-------------|
| `[fecha]` | `v1` | Contrato inicial | Claude |

---

## TIPOS DE DATOS COMPARTIDOS

> Estructuras que usan ambos tracks. Si cambia una, Claude notifica a todos los agentes.

### [NOMBRE DEL TIPO]

```typescript
type [Nombre] = {
  campo: tipo        // descripción
  campo?: tipo       // descripción — opcional
}
```

---

## REGLAS GENERALES DE LA API

- Todas las respuestas son JSON
- Fechas en formato ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`
- IDs son `[string UUID / integer — COMPLETAR]`
- Paginación: `{ data: [], total: n, page: n, limit: n }`
- Errores siempre con campo `error` (string) y opcionalmente `details` (object)
- Autenticación: `[COMPLETAR — JWT / API Key / Session]`

---

## PROTOCOLO DE CAMBIO DE CONTRATO

1. El agente que necesita el cambio documenta por qué en `docs/DECISIONES.md`
2. Escala a Claude con el análisis del impacto
3. Claude aprueba o rechaza con justificación
4. Se actualiza este documento antes de tocar el código
5. Se notifica al agente del otro track antes de implementar

**Un contrato nunca se cambia en el código antes de cambiarse aquí.**

---

*Última actualización: `[COMPLETAR]`*  
*Versión del documento: `[COMPLETAR]`*
