"""
Migration script using Alembic.
Run this to apply pending migrations.
"""
import subprocess
import sys
import os
from pathlib import Path

def run_migrations():
    """Run Alembic migrations."""
    backend_path = Path(__file__).parent.parent
    os.chdir(backend_path)

    try:
        # Run Alembic upgrade
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )

        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)

        if result.returncode == 0:
            print("✅ Migrations applied successfully!")
            return True
        else:
            print(f"❌ Migration failed with code {result.returncode}")
            return False

    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1)
