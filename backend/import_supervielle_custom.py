import sys
import os
import pandas as pd
from sqlalchemy.orm import Session
from io import BytesIO

# Añadir el directorio actual al path para importar src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.models.movement import Movimiento, ImportBatch, engine, SessionLocal
from src.services.parser import ParserService
from src.services.categorizer import CategorizerService

def transform_and_import(file_path):
    if not os.path.isabs(file_path):
        if not os.path.exists(file_path):
             root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
             file_path = os.path.join(root_path, file_path)
             
    print(f"Procesando archivo: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"ERROR: No se encontró el archivo en {file_path}")
        return

    try:
        df_orig = pd.read_excel(file_path)
        df_orig['Crédito'] = df_orig['Crédito'].apply(lambda x: x if x > 0.01 else 0)
        df_orig['Débito'] = df_orig['Débito'].apply(lambda x: x if x > 0.01 else 0)
        df_orig['monto'] = df_orig['Crédito'] - df_orig['Débito']
        df_orig['descripcion'] = df_orig['Concepto'].fillna('') + " - " + df_orig['Detalle'].fillna('')
        df_orig['descripcion'] = df_orig['descripcion'].str.strip(" - ")
        df_orig = df_orig.rename(columns={'Fecha': 'fecha'})
        df_final = df_orig[['fecha', 'descripcion', 'monto']].copy()
        
        db = SessionLocal()
        try:
            existing_movs = db.query(Movimiento).all()
            existing_hashes = {
                ParserService._generate_hash(str(m.fecha), m.descripcion, m.monto)
                for m in existing_movs
            }

            batch = ImportBatch(nombre_archivo=os.path.basename(file_path), cantidad_movimientos=0)
            db.add(batch)
            db.flush()

            count_new = 0
            print("Importando movimientos...")
            
            new_movs = []
            for _, row in df_final.iterrows():
                fecha_val = pd.to_datetime(row['fecha'], dayfirst=True).date()
                desc_val = str(row['descripcion']).strip()
                monto_val = float(row['monto'])
                
                row_hash = ParserService._generate_hash(str(fecha_val), desc_val, monto_val)
                
                if row_hash in existing_hashes:
                    continue
                
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
                new_movs.append(mov)
                existing_hashes.add(row_hash)
                count_new += 1

            batch.cantidad_movimientos = count_new
            db.commit()
            print(f"Éxito: Se importaron {count_new} movimientos nuevos.")
            
            # Categorizar todos los movimientos sin categoría
            print("Ejecutando categorización automática...")
            pending = db.query(Movimiento).filter(Movimiento.categoria == "Sin categorizar").all()
            categorizer = CategorizerService()
            for m in pending:
                categorizer.categorize(m, db)
            
            db.commit()
            print(f"Categorización completada para {len(pending)} movimientos.")

        except Exception as e:
            db.rollback()
            print(f"Error durante la importación: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()

    except Exception as e:
        print(f"Error al abrir o transformar el archivo: {e}")

if __name__ == "__main__":
    path = "docs/Movimientos_Supervielle_01 al 03 . 2026.xlsx"
    transform_and_import(path)
