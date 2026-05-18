import pandas as pd
import hashlib
from io import BytesIO
import unicodedata
from sqlalchemy.orm import Session
from src.models.movement import Movimiento, ImportBatch

class ParserService:
    REQUIRED_COLUMNS = ['fecha', 'descripcion', 'monto']
    SUPERVIELLE_COLUMNS = ['fecha', 'concepto', 'detalle', 'debito', 'credito']

    @staticmethod
    def _generate_hash(fecha, descripcion, monto):
        """Genera un hash único para una transacción."""
        row_str = f"{fecha}|{descripcion}|{monto}"
        return hashlib.md5(row_str.encode()).hexdigest()

    @staticmethod
    def _normalize_column_name(column: str) -> str:
        normalized = unicodedata.normalize("NFKD", str(column))
        normalized = "".join(char for char in normalized if not unicodedata.combining(char))
        return normalized.strip().lower()

    @staticmethod
    def _read_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
        if filename.lower().endswith(".csv"):
            return pd.read_csv(BytesIO(file_bytes))
        return pd.read_excel(BytesIO(file_bytes))

    @staticmethod
    def _prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        df = df.rename(columns={col: ParserService._normalize_column_name(col) for col in df.columns})

        if all(col in df.columns for col in ParserService.REQUIRED_COLUMNS):
            return df[ParserService.REQUIRED_COLUMNS].copy()

        if all(col in df.columns for col in ParserService.SUPERVIELLE_COLUMNS):
            prepared = pd.DataFrame()
            debito = pd.to_numeric(df["debito"], errors="coerce").fillna(0)
            credito = pd.to_numeric(df["credito"], errors="coerce").fillna(0)
            prepared["fecha"] = df["fecha"]
            prepared["descripcion"] = (
                df["concepto"].fillna("").astype(str).str.strip()
                + " - "
                + df["detalle"].fillna("").astype(str).str.strip()
            ).str.strip(" -")
            prepared["monto"] = credito - debito
            return prepared

        expected = ParserService.REQUIRED_COLUMNS
        supervielle = ParserService.SUPERVIELLE_COLUMNS + ["saldo"]
        raise ValueError(
            "Formato no reconocido. Se esperaba columnas "
            f"{expected} o extracto Supervielle con {supervielle}."
        )

    @staticmethod
    def parse_excel(file_bytes: bytes, filename: str, db: Session) -> ImportBatch:
        try:
            df = ParserService._read_dataframe(file_bytes, filename)
            df = ParserService._prepare_dataframe(df)

            # Obtener transacciones existentes para evitar duplicados
            # Para optimización, podríamos filtrar por fechas del Excel, pero por simplicidad
            # y volumen actual de TORO, cargamos lo existente.
            existing_movs = db.query(Movimiento).all()
            existing_hashes = {
                ParserService._generate_hash(str(m.fecha), m.descripcion, m.monto)
                for m in existing_movs
            }

            batch = ImportBatch(nombre_archivo=filename, cantidad_movimientos=0)
            db.add(batch)
            db.flush()

            count_new = 0
            for _, row in df.iterrows():
                fecha_val = pd.to_datetime(row['fecha'], dayfirst=True).date()
                desc_val = str(row['descripcion']).strip()
                monto_val = float(row['monto'])
                
                row_hash = ParserService._generate_hash(str(fecha_val), desc_val, monto_val)
                
                if row_hash in existing_hashes:
                    continue
                
                # Determinar tipo automáticamente si no viene
                tipo_val = "ingreso" if monto_val > 0 else "egreso"

                mov = Movimiento(
                    fecha=fecha_val,
                    descripcion=desc_val,
                    monto=monto_val,
                    categoria="Sin categorizar",
                    tipo=tipo_val,
                    confianza=0.0
                )
                db.add(mov)
                existing_hashes.add(row_hash)
                count_new += 1

            batch.cantidad_movimientos = count_new
            db.commit()
            return batch
        except Exception as e:
            db.rollback()
            raise ValueError(f"Parse error: {str(e)}")
