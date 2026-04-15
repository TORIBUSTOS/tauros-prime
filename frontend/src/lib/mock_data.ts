export interface Movimiento {
  id: string;
  fecha: string;
  descripcion_original: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  subcategoria: string;
  periodo: string;
  metadata_extraida: {
    cuit?: string;
    cbu?: string;
    entidad?: string;
    referencia?: string;
  };
  confianza_porcentaje: number;
  clasificacion_locked: boolean;
}

export interface Insight {
  id: string;
  tipo: 'anomalia' | 'patron' | 'alerta';
  titulo: string;
  descripcion: string;
  impacto: number;
  severidad: 'low' | 'medium' | 'high';
}

export const MOCK_MOVIMIENTOS: Movimiento[] = [
  {
    id: '1',
    fecha: '2026-04-01',
    descripcion_original: 'TRANSFERENCIA DE: OSPACA 30-54678123-9',
    monto: 1250000.00,
    tipo: 'ingreso',
    categoria: 'Ingresos Operativos',
    subcategoria: 'Prestadores Obra Social',
    periodo: '2026-04',
    metadata_extraida: {
      cuit: '30-54678123-9',
      entidad: 'OSPACA',
      referencia: 'ABRIL 2026'
    },
    confianza_porcentaje: 100,
    clasificacion_locked: true
  },
  {
    id: '2',
    fecha: '2026-04-02',
    descripcion_original: 'PAGO PROVEEDOR: SERV CLEAN S.A.',
    monto: -45200.50,
    tipo: 'egreso',
    categoria: 'Gastos Operativos',
    subcategoria: 'Mantenimiento',
    periodo: '2026-04',
    metadata_extraida: {
      entidad: 'SERV CLEAN S.A.',
      referencia: 'INV-4452'
    },
    confianza_porcentaje: 98.5,
    clasificacion_locked: false
  },
  {
    id: '3',
    fecha: '2026-04-03',
    descripcion_original: 'EXTRACCION ATM BANELCO',
    monto: -20000.00,
    tipo: 'egreso',
    categoria: 'Gastos de Oficina',
    subcategoria: 'Caja Chica',
    periodo: '2026-04',
    metadata_extraida: {},
    confianza_porcentaje: 85.0,
    clasificacion_locked: false
  },
  {
    id: '4',
    fecha: '2026-04-04',
    descripcion_original: 'TRANSFERENCIA DE: OSPACA 30-54678123-9',
    monto: 1250000.00,
    tipo: 'ingreso',
    categoria: 'Ingresos Operativos',
    subcategoria: 'Prestadores Obra Social',
    periodo: '2026-04',
    metadata_extraida: {
      cuit: '30-54678123-9',
      entidad: 'OSPACA',
      referencia: 'DEUDA MARZO'
    },
    confianza_porcentaje: 100,
    clasificacion_locked: true
  }
];

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'i1',
    tipo: 'anomalia',
    titulo: 'Duplicación de Cobro: OSPACA',
    descripcion: 'Se detectaron 2 ingresos de OSPACA este mes. Uno corresponde a la liquidación de Abril y otro a un desfasaje de Marzo.',
    impacto: 1250000,
    severidad: 'high'
  },
  {
    id: 'i2',
    tipo: 'patron',
    titulo: 'Gasto Recurrente: Mantenimiento',
    descripcion: 'Los gastos de SERV CLEAN S.A. se mantienen estables respecto al trimestre anterior.',
    impacto: 45200,
    severidad: 'low'
  }
];

export const MOCK_SUMMARY = {
  total_wealth: 12500000.75,
  monthly_growth: 12.5,
  total_ingresos_mes: 2500000.00,
  total_egresos_mes: 65200.50,
  disponibilidad: 8450000.00,
  forecasting_3_months: 15200000.00
};
