<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Maintenance;

// Simular una petición HTTP a la API para obtener un mantenimiento específico
$request = new Illuminate\Http\Request();

$controller = new App\Http\Controllers\Api\MaintenanceController();

try {
    $response = $controller->show(1); // Intentar obtener el mantenimiento con ID 1
    echo "Respuesta exitosa para mantenimiento ID 1:\n";
    echo json_encode($response->getData(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo "Error al obtener mantenimiento ID 1: " . $e->getMessage() . "\n";
}
