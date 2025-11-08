@echo off
title Verificación de Dependencias - Importación de Clientes

echo ====================================
echo Verificando dependencias para importación de clientes...
echo ====================================

:: Verificar si composer está instalado
where composer >nul 2>&1
if %errorlevel% neq 0 (
    echo Composer no está instalado. Por favor, instálalo primero.
    pause
    exit /b 1
)
echo ✓ Composer está instalado

:: Verificar si PhpOffice\PhpSpreadsheet está instalado
cd /d "%~dp0"
composer show phpoffice/phpspreadsheet >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando PhpOffice\PhpSpreadsheet...
    composer require phpoffice/phpspreadsheet
) else (
    echo ✓ PhpOffice\PhpSpreadsheet ya está instalado
)

:: Verificar si las migraciones están actualizadas
echo Verificando migraciones...
php artisan migrate:status

echo.
echo ====================================
echo Verificación completada.
echo ====================================

echo.
echo Para probar la funcionalidad:
echo.
echo 1. Inicia el servidor backend:
echo    php artisan serve
echo.
echo 2. Inicia el servidor frontend:
echo    cd ^<ruta-al-frontend^>
echo    npm run dev
echo.
echo 3. Accede a la aplicación en tu navegador:
echo    http://localhost:5173
echo.
echo 4. Navega a Clientes ^> Importar
echo 5. Selecciona un archivo de prueba ^(puedes usar las plantillas^)
echo.
echo Archivos de plantilla disponibles:
echo - backend\plantilla_clientes.xlsx
echo - backend\plantilla_clientes.csv
echo.
echo Documentación:
echo - backend\DOCUMENTACION_IMPORTACION_CLIENTES.md
echo - backend\GUIA_IMPORTACION_CLIENTES.md
echo.

pause