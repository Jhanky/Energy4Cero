<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Project;

// Simular una petición HTTP a la API
$request = new Illuminate\Http\Request();
$request->merge(['per_page' => 100]);

$controller = new App\Http\Controllers\Api\ProjectController();
$response = $controller->index($request);

echo "Respuesta de la API de proyectos:\n";
echo json_encode($response->getData(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
