import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Añadir el directorio actual al path para importar src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.config import get_settings

def reset_database():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    print(f"Conectado a la base de datos: {settings.DATABASE_URL}")

    try:
        # Tablas a vaciar
        tables = [
            "movimientos",
            "insights",
            "patrones_recurrentes",
            "import_batches",
            "cascada_rules"
        ]

        for table in tables:
            print(f"Vaciando tabla: {table}...")
            db.execute(text(f"DELETE FROM {table}"))
        
        db.commit()
        print("¡Base de datos reseteada exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"Error al resetear la base de datos: {e}")
    finally:
        db.close()

def clean_files():
    print("Buscando archivos Excel para eliminar...")
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    files = os.listdir(backend_dir)
    
    deleted_count = 0
    for file in files:
        if file.endswith(".xlsx") and ("supervielle" in file.lower() or "test_supervielle" in file.lower()):
            file_path = os.path.join(backend_dir, file)
            print(f"Eliminando: {file}")
            os.remove(file_path)
            deleted_count += 1
    
    print(f"Se eliminaron {deleted_count} archivos Excel.")

if __name__ == "__main__":
    reset_database()
    clean_files()
    print("\nTAUROS v2 ha sido reiniciado. Estás listo para empezar de cero.")
