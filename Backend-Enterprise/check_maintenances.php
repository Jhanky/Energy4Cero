<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Maintenance;

echo "Total mantenimientos antes: " . Maintenance::count() . "\n";

// Eliminar mantenimientos de prueba (IDs 2, 3, 4)
$deleted = Maintenance::whereIn('maintenance_id', [2, 3, 4])->delete();
echo "Mantenimientos eliminados: $deleted\n";

echo "Total mantenimientos después: " . Maintenance::count() . "\n";

$maintenances = Maintenance::all();
foreach ($maintenances as $maintenance) {
    echo "ID: {$maintenance->maintenance_id}, Title: {$maintenance->title}, Date: {$maintenance->scheduled_date}\n";
}
