<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DIAGNÓSTICO DE COTIZACIONES ===\n\n";

// 1. Verificar cuántas cotizaciones hay en total
$totalQuotations = \App\Models\Quotation::count();
echo "📊 Total de cotizaciones en la base de datos: $totalQuotations\n\n";

// 2. Listar todas las cotizaciones con sus usuarios
$quotations = \App\Models\Quotation::with('user', 'client')->get();
echo "📋 Listado de cotizaciones:\n";
foreach ($quotations as $quotation) {
    echo "  - ID: {$quotation->quotation_id}\n";
    echo "    Proyecto: {$quotation->project_name}\n";
    echo "    Cliente: " . ($quotation->client ? $quotation->client->name : 'N/A') . "\n";
    echo "    Usuario ID: {$quotation->user_id}\n";
    echo "    Usuario: " . ($quotation->user ? $quotation->user->name : 'N/A') . " (" . ($quotation->user ? $quotation->user->email : 'N/A') . ")\n";
    echo "    Creada: {$quotation->created_at}\n\n";
}

// 3. Verificar el usuario autenticado (simulando el que está logueado)
$adminUser = \App\Models\User::where('email', 'admin@energy4cero.com')->first();
if ($adminUser) {
    echo "👤 Usuario admin@energy4cero.com:\n";
    echo "  - ID: {$adminUser->id}\n";
    echo "  - Nombre: {$adminUser->name}\n";
    echo "  - Email: {$adminUser->email}\n";
    echo "  - Rol: " . ($adminUser->role ? $adminUser->role->slug : 'sin rol') . "\n\n";
    
    // 4. Verificar si el usuario tiene cotizaciones
    $userQuotations = \App\Models\Quotation::where('user_id', $adminUser->id)->count();
    echo "  - Cotizaciones del usuario: $userQuotations\n\n";
} else {
    echo "❌ Usuario admin@energy4cero.com no encontrado\n\n";
}

// 5. Verificar todos los usuarios
echo "👥 Todos los usuarios en el sistema:\n";
$users = \App\Models\User::with('role')->get();
foreach ($users as $user) {
    $quotCount = \App\Models\Quotation::where('user_id', $user->id)->count();
    echo "  - ID: {$user->id} | {$user->name} ({$user->email}) | Rol: " . ($user->role ? $user->role->slug : 'sin rol') . " | Cotizaciones: $quotCount\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===\n";
