<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener permisos del config
        $permissionsConfig = config('permissions', []);

        // Convertir la estructura del config a registros individuales
        $permissions = [];

        foreach ($permissionsConfig as $module => $actions) {
            foreach ($actions as $action => $key) {
                // Generar etiqueta automática
                $label = $this->generateLabel($module, $action);

                $permissions[] = [
                    'module' => $module,
                    'action' => $action,
                    'key' => $key,
                    'label' => $label,
                    'description' => null,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insertar permisos en lotes para mejor rendimiento
        foreach (array_chunk($permissions, 100) as $chunk) {
            Permission::insert($chunk);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar todos los permisos
        Permission::truncate();
    }

    /**
     * Generar etiqueta automática basada en módulo y acción
     */
    private function generateLabel(string $module, string $action): string
    {
        $moduleLabels = [
            'users' => 'Usuarios',
            'roles' => 'Roles',
            'clients' => 'Clientes',
            'quotations' => 'Cotizaciones',
            'projects' => 'Proyectos',
            'inventory' => 'Inventario',
            'support' => 'Soporte',
            'financial' => 'Financiero',
            'commercial' => 'Comercial',
            'settings' => 'Configuración',
            'reports' => 'Reportes',
            'batteries' => 'Baterías',
        ];

        $actionLabels = [
            'create' => 'Crear',
            'read' => 'Ver',
            'update' => 'Editar',
            'delete' => 'Eliminar',
            'export' => 'Exportar',
            'import' => 'Importar',
            'manage_roles' => 'Gestionar Roles',
            'approve' => 'Aprobar',
            'reports' => 'Reportes',
        ];

        $moduleLabel = $moduleLabels[$module] ?? ucfirst($module);
        $actionLabel = $actionLabels[$action] ?? ucfirst($action);

        return "{$actionLabel} {$moduleLabel}";
    }
};
