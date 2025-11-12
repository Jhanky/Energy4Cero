<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Material;
use App\Models\Warehouse;

echo "=== ESTADO DE LA IMPORTACIÓN DE MATERIALES ===\n\n";

try {
    echo "Total de materiales: " . Material::count() . "\n";
    echo "Materiales activos: " . Material::where('is_active', true)->count() . "\n";
    echo "Materiales inactivos: " . Material::where('is_active', false)->count() . "\n";
    echo "Materiales asignados a bodegas: " . Material::whereNotNull('warehouse_id')->count() . "\n";
    echo "Materiales sin asignar: " . Material::whereNull('warehouse_id')->count() . "\n";
    echo "Materiales con stock bajo (< 10): " . Material::where('quantity', '<', 10)->where('quantity', '>', 0)->count() . "\n";
    echo "Materiales agotados: " . Material::where('quantity', '=', 0)->count() . "\n\n";

    echo "=== BODEGAS DISPONIBLES ===\n";
    $warehouses = Warehouse::where('is_active', true)->get();
    if ($warehouses->count() > 0) {
        foreach ($warehouses as $warehouse) {
            echo "- {$warehouse->name} (ID: {$warehouse->id})\n";
        }
    } else {
        echo "No hay bodegas activas configuradas\n";
    }

    echo "\n=== ÚLTIMOS 5 MATERIALES ===\n";
    $recentMaterials = Material::with('warehouse')->latest()->take(5)->get();
    if ($recentMaterials->count() > 0) {
        foreach ($recentMaterials as $material) {
            $warehouseName = $material->warehouse ? $material->warehouse->name : 'Sin asignar';
            echo "- {$material->product_id}: {$material->description} (Cant: {$material->quantity}, Bodega: {$warehouseName})\n";
        }
    } else {
        echo "No hay materiales registrados\n";
    }

    echo "\n=== CATEGORÍAS DE MATERIALES ===\n";
    $categories = Material::select('category')
        ->whereNotNull('category')
        ->where('category', '!=', '')
        ->distinct()
        ->get()
        ->pluck('category');

    if ($categories->count() > 0) {
        foreach ($categories as $category) {
            $count = Material::where('category', $category)->count();
            echo "- {$category}: {$count} materiales\n";
        }
    } else {
        echo "No hay categorías definidas\n";
    }

} catch (Exception $e) {
    echo "❌ Error al consultar la base de datos: " . $e->getMessage() . "\n";
}
