---
name: project-intelligence-mapper
description: |
  Mapea integralmente proyectos software existentes para producir un "Project Intelligence Map" estratégico-técnico.
  
  Usa esta skill cuando necesites:
  - Entender qué es un proyecto existente y qué hace realmente
  - Analizar su arquitectura, lógica de negocio y calidad técnica
  - Evaluar fortalezas, debilidades, deuda técnica y riesgos
  - Determinar si conviene conservar, refactorizar o reconstruir un sistema
  - Detectar qué partes valen la pena reutilizar y cuáles no
  - Cuantificar cómo sería reconstruir el proyecto hoy con herramientas y conocimientos actuales
  - Generar una base inteligible para decisiones de rediseño, automatización o réplicas mejoradas
  
  Triggers: "¿qué es realmente TAUROS/ARGOS/MINOS?", "analizá este proyecto", "mapeá este sistema", "diagnóstico de este repo", "cómo estaría este proyecto hoy", "conviene reconstruir esto?", "inteligencia del proyecto", "arquitectura y calidad de este código"
  
  Funciona con código fuente, documentación, README, estructura de carpetas, notas o descripciones — incluso proyectos incompletos.
compatibility: ~
---

## Cuándo usar esta skill

Usa **project-intelligence-mapper** cuando:

1. **Necesitas entender un proyecto existente holísticamente** — no solo "leer código", sino comprender qué es, qué resuelve, cómo lo resuelve y qué tan bien está hecho.
2. **Tomas decisiones sobre refactores, rediseños o reconstrucciones** — necesitas análisis comparativo entre "cómo está" vs "cómo convendría hacerlo hoy".
3. **Quieres reutilizar partes de un proyecto** — necesitas identificar qué componentes valen la pena conservar y cuáles descartar.
4. **Tienes que comunicar el estado de un proyecto a stakeholders** — precisas diagnóstico estratégico, no solo detalles técnicos.
5. **Planificas la evolución de un sistema** — necesitas entender arquitectura, deuda técnica, riesgos y potencial de mejora.
6. **Evalúas el costo/beneficio de reconstruir vs mantener** — cuantificas cuánto mejor sería rehacerlo con tecnología actual.

## Cuándo NO usar esta skill

- **Si solo necesitas leer o modificar un archivo específico** → usa herramientas de código directo.
- **Si tienes una tarea muy acotada** (una función, un bug puntual) → resuelve eso primero.
- **Si el proyecto es trivial o muy pequeño** (< 500 líneas) → el análisis no agrega valor.
- **Si no tienes acceso a información mínima del proyecto** → necesitas al menos README, estructura de carpetas, o descripción del usuario.

---

## Inputs que puede analizar

Esta skill puede trabajar con:

✓ Código fuente (cualquier lenguaje)  
✓ Arquitectura de carpetas  
✓ README.md, documentación interna  
✓ Diagrama de componentes  
✓ Git history (commit messages, evolution)  
✓ Descripciones textuales del usuario ("qué hace este proyecto")  
✓ Configuración (docker-compose.yml, package.json, requirements.txt, etc)  
✓ Proyectos incompletos, MVPs, prototipos  
✓ Sistemas "heredados" sin documentación  
✓ Mezcla de todo lo anterior  

---

## Marco de análisis

El proyecto se analiza en **5 capas**:

### Capa 1: Identidad
¿Qué es el proyecto? ¿Cuál es su propósito?
- Nombre, tipo de sistema, usuario objetivo
- Problema que resuelve
- Resultado que entrega
- Etapa (MVP, prototipo, productivo, legacy)

### Capa 2: Mapa Funcional  
¿Qué hace? ¿Cuáles son sus partes?
- Funciones principales
- Entradas, procesos, salidas
- Módulos y relaciones entre ellos
- Flujos de datos

### Capa 3: Dominio y Lógica de Negocio
¿Cuál es la "inteligencia" del sistema?
- Entidades clave
- Reglas de negocio críticas
- Flujos principales
- Decisiones arquitectónicas
- Supuestos del negocio

### Capa 4: Arquitectura Técnica
¿Cómo está construido?
- Frontend, backend, datos, integraciones
- Stack de tecnologías
- Patrones de arquitectura
- Estructura de código
- Dependencias clave

### Capa 5: Diagnóstico de Calidad
¿Qué tan bien está hecho?
- Avance y clarity
- Consistencia, escalabilidad, mantenibilidad
- Deuda técnica, riesgos
- Fortalezas y debilidades
- Potencial de rebuild con herramientas actuales

---

## Estructura de Output

SIEMPRE produce un "Project Intelligence Map" con EXACTAMENTE esta estructura:

```
# Project Intelligence Map: [Nombre del Proyecto]

## 1. Identidad del Proyecto
- **Nombre**: 
- **Propósito**: 
- **Tipo de Sistema**: 
- **Usuario Objetivo**: 
- **Problema que Resuelve**: 
- **Resultado que Entrega**: 
- **Etapa Actual**: 

## 2. Mapa Funcional
- **Funciones Principales**: 
- **Entradas**: 
- **Procesos Clave**: 
- **Salidas**: 
- **Módulos Principales**: 
- **Relaciones entre Módulos**: 

## 3. Dominio y Lógica de Negocio
- **Entidades Clave**: 
- **Reglas de Negocio Críticas**: 
- **Flujos Principales**: 
- **Decisiones Arquitectónicas Clave**: 
- **Supuestos del Negocio**: 

## 4. Arquitectura Técnica
- **Frontend**: 
- **Backend**: 
- **Base de Datos**: 
- **Integraciones**: 
- **Stack Tecnológico**: 
- **Estructura de Carpetas**: 
- **Patrones Visibles**: 
- **Dependencias Importantes**: 

## 5. Estado Actual del Proyecto
- **Nivel de Avance**: 
- **Grado de Claridad**: 
- **Consistencia Interna**: 
- **Escalabilidad**: 
- **Mantenibilidad**: 
- **Deuda Técnica**: 
- **Riesgos Identificados**: 

## 6. Qué Está Bien Resuelto
- **Decisiones Valiosas**: 
- **Componentes Reutilizables**: 
- **Fortalezas Técnicas**: 
- **Fortalezas de Producto**: 

## 7. Qué Está Flojo o Limitado
- **Errores de Concepción**: 
- **Partes Innecesarias**: 
- **Complejidad Excesiva**: 
- **Puntos Frágiles**: 
- **Cuellos de Botella**: 

## 8. Rebuild Potencial con Conocimiento Actual
- **Cómo se Haría Hoy**: 
- **Herramientas Modernas Recomendadas**: 
- **Qué se Simplificaría**: 
- **Qué se Automatizaría**: 
- **Qué se Modularizaría Mejor**: 
- **Cambios en UX, Arquitectura y Datos**: 

## 9. Gap entre Versión Actual e Ideal
- **Mejoras de Alto Impacto** (cambiaría significativamente):
- **Mejoras Medianas** (mejoraría bastante):
- **Mejoras Opcionales** (nice-to-have):
- **Quick Wins** (fácil, alto valor):

## 10. Recomendación Ejecutiva
- **Veredicto**: [Conservar | Refactorizar | Rediseñar | Rehacer]
- **Justificación**: 
- **Priorización Sugerida**: 
```

---

## Comportamiento de la Skill

### Principios Fundamentales

1. **Analiza el sistema, no solo el código**
   - Primero: ¿qué hace? ¿qué problema resuelve?
   - Después: ¿cómo lo hace? ¿qué tan bien lo hace?
   - Nunca: saltar directo a refactorización sin entender el propósito.

2. **Separa claramente: Valor vs Construcción**
   - La idea (¿qué valor genera?) es independiente de la implementación (¿qué tan bien está construida?).
   - Un proyecto puede tener una idea excelente pero mala ejecución, o viceversa.

3. **Marca explícitamente incertidumbres**
   - Si faltan datos, di "**[Requiere investigación: ...]**"
   - No inventes componentes sin evidencia.

4. **Detecta la etapa del proyecto**
   - ¿Es MVP? ¿Prototipo? ¿Sistema productivo? ¿Legacy? ¿Refactor en progreso?
   - Esto cambia cómo evalúas la "calidad".

5. **Ofrece visión comparativa**
   - Siempre contrasta: "cómo está" vs "cómo convendría hacerlo hoy".
   - Cuantifica (cualitativamente) mejoras: "ligeramente mejor", "mucho mejor", "radicalmente mejor".

6. **No sobre-diseñes, no subestimes**
   - Si el proyecto está bien hecho para su etapa, dilo.
   - Si está sobre-diseñado, señálalo.
   - Si es un núcleo bueno con mala ejecución, prioriza refactor sobre remake.

---

## Heurísticas Clave

Aplica estas heurísticas durante el análisis:

| Heurística | Aplica Cuando | Qué Haces |
|-----------|--------------|----------|
| **Mapa Conceptual Primero** | Hay módulos nombrados pero poca implementación | Infiere el modelo de negocio antes que arquitectura profunda |
| **Separar Lógica y Técnica** | La lógica de negocio está mezclada con detalles técnicos | Extrae explícitamente las reglas de negocio |
| **Sobrediseño para la Etapa** | El proyecto tiene patrones/complejidad excesiva para su MVP | Señala que es prematuro; refactor primero, escala después |
| **Núcleo Bueno, Ejecución Floja** | Las decisiones arquitectónicas son sólidas pero el código es inconsistente | Refactor (no remake); preserva el diseño |
| **Piezas Reutilizables** | Identifica componentes/patrones que podrían servir en otros sistemas | Destaca explícitamente como "activos reutilizables" |
| **Arquitectura Anticuada, Simplificable** | El diseño refleja decisiones viejas que herramientas modernas hoy simplifican | Menciona tecnologías que lo harían "mucho mejor" |
| **Dependencia de Conocimiento Implícito** | El proyecto requiere conocimiento del creador para entenderlo/mantenerlo | Marca como "riesgo de continuidad"; recomienda documentación |
| **Valor en la Idea, no en la Ejecución** | La idea es buena pero la implementación es débil | Deja claro que hay potencial; reevaluá con mejor ejecución |
| **Replicabilidad Mejorada Hoy** | El proyecto se podría reconstruir más rápido, barato o robusto hoy | Cuantifica cualitativamente (ej: "60% más rápido", "2x más mantenible") |
| **Partes Muertas o Innecesarias** | Módulos no usados, código legacy sin propósito, complejidad acumulada | Recomienda explícitamente qué descartar |

---

## Señales de Riesgo que Detecta

- **Falta de claridad conceptual** → riesgo de que nadie entienda qué hace realmente
- **Inconsistencia interna** → mezcla de patrones, estilos de código, arquitectura
- **Código "mágico" o implícito** → no se entiende sin el creador
- **Acoplamiento fuerte** → cambios ripple, difícil de testear
- **Falta de documentación + código complejo** → riesgo de mantención
- **Stack fragmentado** → muchas tecnologías sin buena razón
- **Escalabilidad dudosa** → funciona para 100 registros, ¿para 100K?
- **Test coverage bajo en lógica crítica** → riesgo de bugs en producción

---

## Criterios de Evaluación para Rebuild

Cuando evalúes si conviene reconstruir hoy, considera:

### Aspectos Técnicos
- ¿Qué frameworks modernos aplican? (React, Vue, Next.js, etc)
- ¿Hay herramientas no-code/low-code que cumplen lo mismo?
- ¿La IA puede acelerar desarrollo? (copilots, code generation)
- ¿Qué automatización es posible hoy que no antes?
- ¿Cómo simplificaría la arquitectura con tecnología actual?

### Aspectos Económicos
- **Velocidad de implementación** → ¿cuánto más rápido?
- **Costo de mantenimiento** → ¿cuánto se reduce?
- **Escala posible** → ¿hasta dónde sin refactor?
- **Deuda técnica acumulada** → ¿costo de seguir pagando?

### Aspectos de Calidad
- **Mantenibilidad** → ¿más o menos clara la lógica?
- **Testabilidad** → ¿más fácil escribir tests?
- **UX posible hoy** → ¿mejor interfaz con herramientas actuales?
- **Integración** → ¿más fácil conectarse con otros sistemas?

### Veredicto Final
- **CONSERVAR** → Ideas y ejecución valiosas; mejora incremental
- **REFACTORIZAR** → Núcleo bueno, ejecución mejorable
- **REDISEÑAR** → Idea valiosa, arquitectura anticuada
- **REHACER** → Idea es buena pero implementación es débil o poco escalable

---

## Ejemplos de Prompts Que Resuelve

```
1. "Mapeá TAUROS y decime qué es realmente"
2. "Analizá este proyecto y armame un mapa para entenderlo"
3. "Quiero saber si conviene reconstruir este sistema hoy"
4. "Tomá este repo y explicame módulos, lógica y calidad"
5. "Hacé un Project Intelligence Map de este MVP"
6. "Diagnóstico de este proyecto: ¿qué tan bien está hecho?"
7. "¿Cuánto mejor sería rehacerlo hoy con herramientas actuales?"
8. "Convertí este sistema en un mapa reutilizable para futuras decisiones"
9. "¿Qué partes valen la pena conservar y cuáles no?"
10. "Analizá la arquitectura y decime si hay deuda técnica"
```

---

## Notas Prácticas

- **Si falta información**, marca explícitamente `[Requiere investigación: ...]` y continúa con lo que sí ves.
- **No inventes arquitectura** — si no ves evidencia de un componente, no lo asumas.
- **Si el proyecto está incompleto**, describe lo que ves + nota "**Estado: MVP/Prototipo**" en la etapa.
- **Si hay git history**, considera commits recientes para evaluar velocidad de cambio y patrones.
- **Si el usuario describe qué hace el proyecto**, usa eso como "verdad de negocio" aunque el código no lo refleje claramente.

---

## Tags

`#analysis` `#architecture` `#strategic` `#enterprise` `#decision-making` `#legacy-systems` `#refactoring` `#rebuild-evaluation`
