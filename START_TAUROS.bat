@echo off
TITLE TAUROS Prime - Intelligence Hub (Stabilizer v2)
SETLOCAL EnableExtensions

:: 1. IDENTIFICAR DIRECTORIO BASE (Compatible con OneDrive/UNC)
SET "BASE_DIR=%~dp0"
IF "%BASE_DIR:~-1%"=="\" SET "BASE_DIR=%BASE_DIR:~0,-1%"

SET "BACKEND_DIR=%BASE_DIR%\backend"
SET "FRONTEND_DIR=%BASE_DIR%\frontend"

echo ==========================================================
echo [TAUROS] Iniciando Motores de Inteligencia...
echo [PATH] %BASE_DIR%
echo ==========================================================

:: 2. VERIFICAR PYTHON Y DEPENDENCIAS
echo [BACKEND] Verificando entorno Python...
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    SET "PY_CMD=python"
) else (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        SET "PY_CMD=py"
    ) else (
        echo [ERROR] No se detecto Python instalado. Por favor instala Python 3.10+
        pause
        exit /b 1
    )
)

echo [BACKEND] Instalando/Actualizando dependencias...
pushd "%BACKEND_DIR%"
%PY_CMD% -m pip install -r requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Hubo un problema instalando dependencias. Intentando arrancar de todos modos...
)
popd

:: 3. LANZAR SERVICIOS (Windows Terminal vs CMD)
where wt.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [TAUROS] Usando Windows Terminal...
    :: Backend con uvicorn directo (mas estable que -m src.main)
    wt -d "%BASE_DIR%" --title "TAUROS Backend" cmd /k "pushd \"%BACKEND_DIR%\" && echo Iniciando Backend... && %PY_CMD% -m uvicorn src.main:app --host 0.0.0.0 --port 9000 --reload"; ^
       new-tab -d "%BASE_DIR%" --title "TAUROS Frontend" cmd /k "pushd \"%FRONTEND_DIR%\" && echo Iniciando Frontend... && npm run dev"
) else (
    echo [TAUROS] Usando consolas separadas...
    
    :: Iniciar Backend
    start "TAUROS Backend (9000)" cmd /k "pushd \"%BACKEND_DIR%\" && %PY_CMD% -m uvicorn src.main:app --host 0.0.0.0 --port 9000 --reload"
    
    :: Iniciar Frontend
    start "TAUROS Frontend (7000)" cmd /k "pushd \"%FRONTEND_DIR%\" && npm run dev"
)

:: 4. ESPERAR Y LANZAR BROWSER
echo [TAUROS] Esperando a que el motor caliente (10s)...
timeout /t 10 /nobreak >nul

echo [TAUROS] Desplegando interfaz en Chrome...
start chrome "http://localhost:7000"

echo ==========================================================
echo [OK] TAUROS Prime esta operativo.
echo Si ves un error de 'Failed to Fetch', revisa la ventana de Backend.
echo ==========================================================
pause
