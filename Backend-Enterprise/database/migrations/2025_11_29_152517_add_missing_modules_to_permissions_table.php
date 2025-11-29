<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar permisos faltantes de módulos clients y quotations
        $missingPermissions = [
            // Clients
            [
                'module' => 'clients',
                'action' => 'create',
                'key' => 'clients.create',
                'label' => 'Crear Clientes',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'clients',
                'action' => 'read',
                'key' => 'clients.read',
                'label' => 'Ver Clientes',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'clients',
                'action' => 'update',
                'key' => 'clients.update',
                'label' => 'Editar Clientes',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'clients',
                'action' => 'delete',
                'key' => 'clients.delete',
                'label' => 'Eliminar Clientes',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'clients',
                'action' => 'export',
                'key' => 'clients.export',
                'label' => 'Exportar Clientes',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Quotations
            [
                'module' => 'quotations',
                'action' => 'create',
                'key' => 'quotations.create',
                'label' => 'Crear Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'quotations',
                'action' => 'read',
                'key' => 'quotations.read',
                'label' => 'Ver Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'quotations',
                'action' => 'update',
                'key' => 'quotations.update',
                'label' => 'Editar Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'quotations',
                'action' => 'delete',
                'key' => 'quotations.delete',
                'label' => 'Eliminar Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'quotations',
                'action' => 'approve',
                'key' => 'quotations.approve',
                'label' => 'Aprobar Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'quotations',
                'action' => 'export',
                'key' => 'quotations.export',
                'label' => 'Exportar Cotizaciones',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insertar permisos en lotes para mejor rendimiento
        foreach (array_chunk($missingPermissions, 50) as $chunk) {
            Permission::insert($chunk);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar permisos de clients y quotations
        Permission::whereIn('module', ['clients', 'quotations'])->delete();
    }
};
