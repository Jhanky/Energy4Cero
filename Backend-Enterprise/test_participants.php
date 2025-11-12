<?php

// Script para probar que los participantes se guarden correctamente
require_once 'vendor/autoload.php';

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Maintenance;
use Illuminate\Support\Facades\Http;

echo "=== PRUEBA DE PARTICIPANTES EN MANTENIMIENTOS ===\n\n";

// Datos de prueba para crear un mantenimiento con participantes
$testData = [
    'title' => 'Mantenimiento de Prueba con Participantes',
    'description' => 'Prueba para verificar que los participantes se guarden correctamente',
    'type' => 'preventive',
    'priority' => 'medium',
    'scheduled_date' => date('Y-m-d', strtotime('+7 days')),
    'project_id' => 2, // Usar un proyecto existente
    'created_by_user_id' => 1, // Usuario que crea el mantenimiento
    'participants' => [1, 2], // IDs de usuarios existentes
    'notes' => 'Notas de prueba para participantes'
];

echo "1. Creando mantenimiento con participantes...\n";
echo "Datos enviados:\n";
print_r($testData);
echo "\n";

// Crear el mantenimiento usando el modelo directamente
try {
    $maintenance = Maintenance::create($testData);
    echo "✅ Mantenimiento creado exitosamente con ID: {$maintenance->maintenance_id}\n\n";

    // Verificar que los participantes se guardaron
    echo "2. Verificando que los participantes se guardaron...\n";
    $savedMaintenance = Maintenance::find($maintenance->maintenance_id);

    echo "Participantes guardados: ";
    print_r($savedMaintenance->participants);
    echo "\n";

    if ($savedMaintenance->participants && is_array($savedMaintenance->participants) && count($savedMaintenance->participants) === 2) {
        echo "✅ Los participantes se guardaron correctamente!\n\n";
    } else {
        echo "❌ Error: Los participantes no se guardaron correctamente\n\n";
    }

    // Probar la API completa
    echo "3. Probando API completa (GET /api/maintenances/{$maintenance->maintenance_id})...\n";

    // Simular una petición HTTP usando curl
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/maintenances/{$maintenance->maintenance_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['success'] && isset($data['data']['maintenance']['participant_users'])) {
            $participantUsers = $data['data']['maintenance']['participant_users'];
            echo "✅ API responde correctamente\n";
            echo "Usuarios participantes encontrados: " . count($participantUsers) . "\n";

            if (count($participantUsers) === 2) {
                echo "✅ Los participantes se muestran correctamente en la API!\n";
                foreach ($participantUsers as $user) {
                    echo "  - {$user['name']} ({$user['email']})\n";
                }
            } else {
                echo "❌ Error: Número incorrecto de participantes en la API\n";
            }
        } else {
            echo "❌ Error en la respuesta de la API\n";
        }
    } else {
        echo "❌ Error HTTP: {$httpCode}\n";
        echo "Respuesta: {$response}\n";
    }

    // Limpiar: eliminar el mantenimiento de prueba
    echo "\n4. Limpiando datos de prueba...\n";
    $maintenance->delete();
    echo "✅ Mantenimiento de prueba eliminado\n";

} catch (Exception $e) {
    echo "❌ Error al crear mantenimiento: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DE PRUEBA ===\n";
