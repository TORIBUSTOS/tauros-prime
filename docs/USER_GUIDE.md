# User Guide — TORO_Prime

**Bóveda Digital para Análisis Financiero Inteligente**

---

## 🚀 Primeros Pasos

### 1. Iniciar la Aplicación

```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python src/main.py
# Espera: "Uvicorn running on http://0.0.0.0:9000"

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Espera: "Local: http://localhost:7000"
```

Abre **http://localhost:7000** en el navegador.

---

## 📥 Importar Datos Bancarios

### Paso 1: Preparar Archivo Excel

Archivo esperado:
- Formato: `.xlsx` o `.csv`
- Columnas: `fecha` | `descripcion` | `monto`
- Ejemplo:
  ```
  fecha       | descripcion        | monto
  2025-06-01  | OSPACA PAGO        | -1500
  2025-06-05  | DEPOSITO CLIENTE   | 5000
  2025-06-10  | TRANSFER PROPIA    | -2000
  ```

**Para Supervielle**: El banco proporciona Débito/Crédito:
```
Fecha | Concepto | Detalle | Débito | Crédito | Saldo
→ Transformar a: monto = Crédito - Débito
```

### Paso 2: Importar en Dashboard

1. Haz click en **"Cargar Movimientos"** (cuadro punteado)
2. Selecciona tu archivo `.xlsx`
3. Espera el toast verde: **"✅ Éxito: Se importaron 45 movimientos."**

✅ Los datos ahora están en la Bóveda Digital.

---

## 📊 Entender el Dashboard

### Sección 1: Seleccionar Período

En el **Sidebar izquierdo**, elige el período:
- Dropdown muestra todos los meses con datos
- Default: Mes más reciente
- **Al cambiar periodo**: Toda la app se sincroniza (Insights, Reportes, Analytics)

### Sección 2: Resumen Rápido

**Cards superiores** muestran:
- **Ingresos Totales**: Total de transacciones positivas
- **Egresos Totales**: Total de transacciones negativas
- **Resultado Neto**: Balance (Ingresos - Egresos)

### Sección 3: Transacciones Recientes

Última 10 transacciones del período:
- Ordenadas por fecha (más reciente primero)
- Click en cualquier fila para expandir detalles

### Sección 4: Insights Inteligentes

**Lo que hace TORO_Prime diferente**:

Ejemplo:
- ❌ Dashboard normal: "OSPACA es 40% de ingresos"
- ✅ **TORO_Prime**: "OSPACA está 2x arriba porque pagó mes anterior atrasado. No es cambio estructural."

Tipos de Insight:
- 🔄 **Patrón**: Recurrencia detectada (ej: Pago mensual)
- ⚠️ **Outlier**: Transacción inusual (ej: Gasto 10x normal)
- 📍 **Anomalía Contextual**: Outlier con explicación (ej: Deuda acumulada)

---

## 📈 Reportes P&L

Haz click en **"Reportes"** en el sidebar.

### Estructura Jerárquica

```
INGRESOS                     $45,000.00
├─ Suscripciones             $18,000.00 (+5.2%)  [→]
│  ├─ Anual Plan             $12,000.00
│  └─ Monthly Plan            $6,000.00
└─ Servicios                 $27,000.00 (-2.1%)  [→]

EGRESOS                      $28,000.00
├─ Proveedores               $15,000.00 (+1.5%)  [→]
└─ Obra Social                $8,000.00 (0%)     [→]

RESULTADO NETO               $17,000.00 ✅
```

### Drill-Down (Contexto Linkage)

**Click en cualquier categoría** → Filtra automáticamente en **"Movimientos"**

Ejemplo:
1. Click en "Suscripciones" en P&L
2. Se abre `/movimientos?categoria=Suscripciones`
3. Ves TODAS las transacciones de Suscripciones del período

**Botón "→" (hover)** = Ir a detalles.

---

## 🔎 Explorar Movimientos

Haz click en **"Movimientos"** en el sidebar.

### Tabla Completa

Todas las transacciones del período:
- **Columnas**: Fecha | Descripción | Monto | Categoría | Confianza
- **Ordenado**: Por fecha (más reciente primero)
- **Max**: 500 registros por carga

### Filtros

**1. Búsqueda**: Escribe en "Buscar por descripción o categoría..."
- Busca en ambos campos en tiempo real

**2. Tipo**:
- **Todos**: Todas las transacciones
- **Ingresos**: Solo positivas
- **Egresos**: Solo negativas

### Ejemplo de Análisis

Caso: Quiero ver todos los pagos a OSPACA en junio

1. Período: "2025-06" (ya seleccionado)
2. Escribe en búsqueda: "OSPACA"
3. Filtra: Todos/Egresos (según quieras)
4. Ves:
   - 2025-06-05: OSPACA PAGO -1500.00
   - 2025-06-20: OSPACA ATRASO -1500.00

---

## 📉 Analytics Avanzado

Haz click en **"Análisis"** en el sidebar.

### Gráficos Disponibles

**1. Flujo de Caja (Flow Chart)**
- Acumulado día a día
- Verde (ingreso) / Rojo (egreso)
- Muestra tendencia del mes

**2. Distribución de Categorías (Pie Chart)**
- Ingresos: ¿De dónde viene el dinero?
- Egresos: ¿A dónde va el dinero?
- Clickeable: Expandir para subcategorías

**3. Análisis de "Hormigas" (Micro-gastos)**
- Gastos pequeños recurrentes
- Ej: 10 gastos de $50 = $500 perdido
- **Impacto**: Identifica fugas de capital

---

## 🔮 Proyecciones (Forecast)

En el **Dashboard**, sección "Próximos 3 Meses":

### 3 Escenarios

| Escenario | Cambio | Descripción |
|-----------|--------|-------------|
| 📈 **Optimista** | +20% | Mejores conversiones, más suscripciones |
| ➡️ **Realista** | Baseline | Tendencia histórica |
| 📉 **Pesimista** | -30% | Pérdida de clientes, estacionalidad baja |

### Cómo Usar

- **Planning**: "¿Tengo cash para pagar proveedores en sept?"
- **Risk**: "¿Y si los ingresos caen 30%?"
- **Targets**: "Necesito +$5k. ¿Qué escenario me lo permite?"

---

## 💬 Notificaciones (Toasts)

**Sistema de Feedback Visual**:

| Tipo | Color | Cuándo |
|------|-------|--------|
| ✅ **Éxito** | Verde | Archivo importado, acción completada |
| ❌ **Error** | Rojo | Falló importación, conexión perdida |
| ℹ️ **Info** | Dorado | Acción en progreso |
| ⚠️ **Advertencia** | Naranja | Advertencia (en desarrollo) |

Aparecen **arriba derecha**, desaparecen en 5 segundos.

---

## ⌨️ Atajos (Próximamente)

| Atajo | Acción |
|-------|--------|
| `Cmd/Ctrl + K` | Buscar globally |
| `Cmd/Ctrl + I` | Importar archivo |
| `Cmd/Ctrl + R` | Refrescar datos |

---

## 🛠️ Troubleshooting

### "Error de conexión con la Bóveda Digital"
- ✅ Verifica que backend esté corriendo: `http://localhost:9000/api/health`
- Debería devolver: `{"status": "ok"}`

### "Archivo rechazado"
- ✅ Columnas deben ser exactas: `fecha`, `descripcion`, `monto`
- ✅ Formato: `.xlsx` o `.csv`
- ✅ No vacío

### "Categorías no aparecen"
- ✅ Primero importa un archivo
- ✅ Las categorías se crean automáticamente
- ✅ Confianza baja? Necesita más reglas (admin panel próximamente)

### "Período no aparece"
- ✅ Necesita al menos 1 movimiento en ese mes
- ✅ Importa archivo con fechas en ese período

---

## 📞 Soporte

Para reportar bugs o sugerencias:
- 📧 team@toro.local
- 🐛 GitHub Issues: `/issues`

**Status actual**: Beta Abierta (Apr 2026)

---

*Última actualización: 2026-04-09*  
*Versión: 1.0 Beta*  
*Léeme en pareja con: `docs/API.md` y `docs/ARCHITECTURE.md`*
