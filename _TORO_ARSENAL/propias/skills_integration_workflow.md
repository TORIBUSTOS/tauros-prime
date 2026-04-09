---
description: Workflow para integrar un "Skill" en el codebase de TORO/TAUROS
---

# Workflow de Integración de Skills

Este workflow define los pasos estándar para incorporar una herramienta o patrón desde la carpeta `skills/` al proyecto principal.

## 1. Selección y Análisis
1.  Identificar la necesidad (e.g., "Necesito mejores gráficos" -> `ui-ux-pro-max`).
2.  Leer el archivo `SKILL.md` dentro de la carpeta del skill correspondiente (`skills/CATEGORY/SKILL_NAME/SKILL.md`).
3.  Verificar dependencias (e.g., ¿Requiere Python? ¿Node.js? ¿API Keys?).

## 2. Preparación del Entorno
1.  Si el skill tiene scripts, verificar si se pueden ejecutar directamente o si requieren instalación.
2.  Si requiere API Keys, añadirlas al archivo `.env` local.

## 3. Implementación (Ciclo Rápido)
1.  **Ejecutar Script/Herramienta:** Usar el skill para generar el código o asset necesario.
    *   *Ejemplo:* `python skills/ui-ux-pro-max/scripts/search.py "dark mode financial dashboard" --domain style`
2.  **Adaptar Código:** Copiar el output generado (snippet de código, configuración JSON, etc.) al codebase de TORO/TAUROS.
    *   Frontend: `frontend/src/components/` o `frontend/src/pages/`.
    *   Backend: `backend/core/` o `backend/api/`.

## 4. Verificación
1.  Ejecutar el proyecto localmente (`npm run dev` o `uvicorn backend.main:app`).
2.  Verificar que la nueva funcionalidad (gráfico, parser, etc.) funciona como se espera.

## 5. Documentación
1.  Actualizar `CHANGELOG.md` mencionando el skill integrado.
2.  Si se agregaron nuevas dependencias, actualizar `package.json` o `requirements.txt`.
