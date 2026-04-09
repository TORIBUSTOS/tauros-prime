# VISION.md — Visión Estratégica de TORO_Prime

## La Idea Central

**TORO_Prime** es la plataforma de análisis financiero que transforma extractos bancarios crudos en **inteligencia estratégica accionable** para la toma de decisiones de TORO Holding.

No es un dashboard bonito que ordena transacciones. Es un **motor de insights inteligente** que filtra el ruido financiero y resalta lo que realmente importa.

---

## El Problema que Resuelve

TAUROS (v1) demostró el valor de tener datos ordenados. Pero dejó un vacío:

- ✅ Los extractos están categorizados
- ✅ Se ven gráficos bonitos
- ❌ **Pero no da insights estratégicos para decisiones reales**

Ejemplos:
- Dice "OSPACA es 20% de ingresos" (irrelevante, pasa una vez al mes)
- Dice "Gastos subieron 100%" (no detecta que es timing de pagos, no cambio real)
- Categorías "lindas pero imprecisas" (mucho "Otros" = análisis débil)

**TORO_Prime resuelve esto.**

---

## Los 3 Pilares de Decisión

TORO_Prime habilita **3 decisiones estratégicas clave**:

### 1. **Optimización de Costos**
*"¿Dónde se va el dinero realmente y dónde podemos cortar gastos?"*

- Visibilidad quirúrgica: gastos fijos vs variables
- Identificación de "hormigas" (pequeños gastos recurrentes que suman)
- Oportunidades de reducción por área
- Presupuesto mejorado para otras áreas

### 2. **Forecasting de Flujo de Caja (3 meses)**
*"¿Qué obligaciones/pagos vienen y cuánto margen tenemos?"*

- Proyecciones de pagos recurrentes
- Detección de picos de gasto
- Margen para contingencias
- Oportunidades de inversión

### 3. **Disponibilidad de Fondos para Reinversión**
*"¿Hay capital disponible para crecer?"*

- Saldo libre proyectado
- Análisis de flujo (ingresos - obligaciones)
- Decisiones de capex, expansión, initiatives

---

## El Diferenciador: Motor de INSIGHTS Inteligente

La clave de TORO_Prime está en un **motor de análisis que es verdaderamente inteligente**:

- **Filtra ruido**: Detecta pagos puntuales vs patrones recurrentes
- **Entiende contexto**: OSPACA paga fin de mes pero a veces cae en el siguiente → "este mes hay 2x, no es cambio estructural"
- **Alerta en contexto**: "Ingresos +100% PORQUE OSPACA se duplicó por timing, flujo real: +0%"
- **Solo resalta lo importante**: Solo cambia reales en patrones, no anomalías de calendario

Eso es lo que cuesta: **lógica + histórico + detección de patrones recurrentes**.

---

## Características Principales

- **Ingesta flexible**: Extractos de cualquier período (1 día, 15 días, 1 mes)
- **Categorización precisa**: Motor cascada mejorado, >99% confianza
- **Análisis ágil**: Charts y análisis funciona con cualquier período
- **Análisis estratégico**: Forecasting, patrones, insights requieren data mensual completa
- **Agnóstico de período**: Sube lo que quieras, el sistema se adapta
- **Arquitectura limpia**: Preparada para integraciones futuras (sin acoplamiento)

---

## Scope de TORO_Prime v1

### ✅ Incluido:
- Consolidación de extractos bancarios
- Categorización cascada mejorada (>99% confianza)
- Motor de insights inteligente
- Forecasting 3 meses (automático + manual)
- Dashboard de análisis
- Reportes P&L jerárquicos
- Analytics de patrones y KPIs
- API REST documentada (para futuras integraciones)

### ❌ NO Incluido (para v1):
- Multi-user / multi-tenant
- Integraciones bancarias directas (API de bancos)
- Cloud deployment
- Sincronización con otros sistemas TORO (solo arquitectura preparada)

---

## Contexto y Alcance

- **Usuario**: Single-user (tú, CFO/Director de TORO)
- **Deploy**: Local, on-prem
- **Período de evolución**: Etapas, sin timelines
- **Input**: Extractos bancarios mensuales de Sanarte (y otros bancos si aplica)
- **Output**: Dashboard + Reportes + Insights estratégicos
- **Futuro**: Cuando haya suficientes herramientas, un "hub central" integrará TORO_Prime + otros módulos

---

## Stack Técnico

- **Backend**: FastAPI (Python 3.12) + SQLite
- **Frontend**: Next.js (moderno, flexible, optimizado para UI)
- **Arquitectura**: API-First Modular (desacoplado, extensible)
- **Diseño**: Kit de marca TORO (a entregar)

---

## Éxito de TORO_Prime v1

**TORO_Prime está lista cuando:**

1. ✅ Extractos se categorizan con >99% confianza
2. ✅ Motor de insights detecta y filtra anomalías de timing
3. ✅ Dashboard muestra los 3 pilares de decisión claramente
4. ✅ Reportes P&L son precisos y jerárquicos
5. ✅ Forecasting 3 meses es confiable (histórico + manual)
6. ✅ Insights son accionables (no genéricos)
7. ✅ Arquitectura permite agregar conectores sin refactorizar core

---

*Versión: 1.0*  
*Última actualización: 2026-04-08*  
*Propuesta por: Claude*  
*Estado: En proceso de Misión*
