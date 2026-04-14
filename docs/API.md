# API Documentation — TAUROS v2

**Base URL**: `http://localhost:9000/api`  
**Format**: JSON  
**Auth**: None (Development mode)

---

## 📤 POST `/import`

Carga archivos Excel/CSV con movimientos bancarios.

### Request
- **File**: `file` (multipart/form-data)
  - Formato: `.xlsx` o `.csv`
  - Columnas requeridas: `fecha`, `descripcion`, `monto`

### Response (200 OK)
```json
{
  "batch_id": 1,
  "movimientos": 45,
  "status": "procesado"
}
```

### Error (400)
```json
{
  "detail": "Solo .xlsx o .csv"
}
```

---

## 📥 GET `/movements`

Obtiene movimientos con filtros opcionales.

### Query Parameters
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `period` | string | Filtrar por período (YYYY-MM) | `2025-06` |
| `categoria` | string | Filtrar por categoría | `Suscripciones` |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "fecha": "2025-06-15",
    "descripcion": "OSPACA",
    "monto": -1500.0,
    "categoria": "Obra Social",
    "subcategoria": null,
    "tipo": "egreso",
    "confianza": 0.92,
    "created_at": "2026-04-09T10:30:00"
  }
]
```

**Nota**: Máximo 500 registros por request.

---

## 🧠 GET `/insights`

Genera insights inteligentes sobre patrones anómalos.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `period` | string | ✅ | Período (YYYY-MM) |

### Response (200 OK)
```json
{
  "period": "2025-06",
  "insights": [
    {
      "type": "context_anomaly",
      "confidence": 0.87,
      "titulo": "OSPACA Pago Atrasado",
      "descripcion": "OSPACA pagó 2x su monto usual. Probablemente deuda del mes anterior.",
      "categoria": "Obra Social",
      "monto": 3000.0,
      "fecha": "2025-06-20"
    }
  ]
}
```

**Tipos de Insight**:
- `pattern`: Patrón recurrente detectado
- `outlier`: Transacción inusual
- `context_anomaly`: Anomalía con contexto (timing, deuda, etc)

---

## 📊 GET `/forecast`

Proyecciones de 3 meses con escenarios.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `desde` | string | ✅ | Período inicial (YYYY-MM) |

### Response (200 OK)
```json
{
  "periodo_base": "2025-06",
  "forecast": [
    {
      "mes": "2025-07",
      "expected_total": 15000.0,
      "confidence": 0.85,
      "breakdown": {
        "ingresos": 18000.0,
        "egresos": 3000.0
      }
    }
  ],
  "scenarios": {
    "optimistic": {
      "total_3m": 50000.0,
      "description": "+20% vs realistic"
    },
    "realistic": {
      "total_3m": 42000.0,
      "description": "Baseline"
    },
    "pessimistic": {
      "total_3m": 30000.0,
      "description": "-30% vs realistic"
    }
  }
}
```

---

## 💰 GET `/summary`

Sumario financiero sin descargar todos los movimientos.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `period` | string | ✅ | Período (YYYY-MM) |

### Response (200 OK)
```json
{
  "period": "2025-06",
  "ingresos_total": 45000.0,
  "egresos_total": 28000.0,
  "balance": 17000.0,
  "transaction_count": 87
}
```

---

## 📋 GET `/reports/periods`

Lista períodos con datos disponibles.

### Response (200 OK)
```json
["2025-08", "2025-07", "2025-06"]
```

---

## 📈 GET `/reports/pl`

Reporte P&L (Profit & Loss) con desglose jerárquico.

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `period` | string | ✅ | Período (YYYY-MM) |

### Response (200 OK)
```json
{
  "periodo": "2025-06",
  "ingresos_total": 45000.0,
  "egresos_total": 28000.0,
  "resultado_neto": 17000.0,
  "nodos": [
    {
      "nombre": "INGRESOS",
      "total": 45000.0,
      "hijos": [
        {
          "nombre": "Suscripciones",
          "total": 18000.0,
          "variacion": 5.2,
          "hijos": []
        }
      ]
    }
  ]
}
```

---

## ❌ Error Handling

Todos los errores retornan:
```json
{
  "detail": "Descripción del error"
}
```

### Status Codes
| Código | Significado |
|--------|-------------|
| 200 | OK |
| 400 | Bad Request (parámetros inválidos) |
| 500 | Server Error |

---

## 🔗 Frontend Integration

```typescript
const apiService = {
  importMovements: async (file: File) => { /* ... */ },
  getMovements: async (period?: string) => { /* ... */ },
  getInsights: async (period: string) => { /* ... */ },
  getForecast: async (desde: string) => { /* ... */ },
  getSummary: async (period: string) => { /* ... */ },
  getReportPL: async (period: string) => { /* ... */ }
}
```

Ubicación: `frontend/src/services/api.service.ts`
