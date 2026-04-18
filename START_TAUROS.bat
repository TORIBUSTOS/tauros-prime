@echo off
REM ==========================================================
REM TAUROS PRIME - STABILIZER SCRIPT v5 (Final Path Fix)
REM ==========================================================
TITLE TAUROS Prime (Path Refined)

SET "BASE_DIR=%~dp0"
IF "%BASE_DIR:~-1%"=="\" SET "BASE_DIR=%BASE_DIR:~0,-1%"

SET "BACKEND_DIR=%BASE_DIR%\backend"
SET "FRONTEND_DIR=%BASE_DIR%\frontend"
SET "VENV_PY=%BACKEND_DIR%\venv\Scripts\python.exe"

echo ----------------------------------------------------------
echo [TAUROS] Directorio: %BASE_DIR%
echo ----------------------------------------------------------

REM 1. VERIFICAR VENV
IF EXIST "%VENV_PY%" (
    echo [OK] Entorno virtual encontrado.
    goto :PREPARE
)

echo [WARNING] No se encontro el entorno virtual.
echo [INFO] Creando nuevo entorno virtual...

REM Intentar con 'python' luego con 'py'
python --version >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    SET "G_PY=python"
) ELSE (
    py --version >nul 2>nul
    IF %ERRORLEVEL% EQU 0 (
        SET "G_PY=py"
    ) ELSE (
        echo [ERROR] No se encontro Python en el sistema.
        pause
        exit /b 1
    )
)

"%G_PY%" -m venv "%BACKEND_DIR%\venv"

:PREPARE
REM 2. ASEGURAR DEPENDENCIAS
echo [INFO] Verificando dependencias en venv...
"%VENV_PY%" -m pip install uvicorn fastapi python-multipart -r "%BACKEND_DIR%\requirements.txt" --quiet

REM 3. LANZAR SERVICIOS (Usando /D para evitar errores de sintaxis en el comando)
echo [INFO] Lanzando Backend...
start "TAUROS_BACKEND" /D "%BACKEND_DIR%" cmd /k ""%VENV_PY%" -m uvicorn src.main:app --host 0.0.0.0 --port 9000 --reload"

echo [INFO] Lanzando Frontend...
start "TAUROS_FRONTEND" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

echo [INFO] Esperando inicializacion (10s)...
timeout /t 10 /nobreak >nul

echo [OK] Abriendo navegador...
start chrome "http://localhost:7000"

echo ==========================================================
echo PROCESO FINALIZADO. Revisa las otras ventanas.
echo ==========================================================
pause
