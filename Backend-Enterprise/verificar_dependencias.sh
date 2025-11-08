#!/bin/bash

# Script para verificar e instalar dependencias necesarias para la importación de clientes

echo "Verificando dependencias para importación de clientes..."

# Verificar si composer está instalado
if ! command -v composer &> /dev/null
then
    echo "Composer no está instalado. Por favor, instálalo primero."
    exit 1
fi

echo "✓ Composer está instalado"

# Verificar si PhpOffice\PhpSpreadsheet está instalado
cd /path/to/your/project/backend
if composer show phpoffice/phpspreadsheet &> /dev/null
then
    echo "✓ PhpOffice\PhpSpreadsheet ya está instalado"
else
    echo "Instalando PhpOffice\PhpSpreadsheet..."
    composer require phpoffice/phpspreadsheet
fi

# Verificar si las migraciones están actualizadas
echo "Verificando migraciones..."
php artisan migrate:status

echo "Verificación completada."

echo "
====================================
FUNCIONALIDAD DE IMPORTACIÓN LISTA
====================================

Para probar la funcionalidad:

1. Inicia el servidor backend:
   php artisan serve

2. Inicia el servidor frontend:
   cd /path/to/frontend
   npm run dev

3. Accede a la aplicación en tu navegador:
   http://localhost:5173

4. Navega a Clientes -> Importar
5. Selecciona un archivo de prueba (puedes usar las plantillas)

Archivos de plantilla disponibles:
- backend/plantilla_clientes.xlsx
- backend/plantilla_clientes.csv

Documentación:
- backend/DOCUMENTACION_IMPORTACION_CLIENTES.md
- backend/GUIA_IMPORTACION_CLIENTES.md
"