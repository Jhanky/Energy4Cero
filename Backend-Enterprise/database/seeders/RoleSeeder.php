<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener configuración de permisos
        $permissionsConfig = config('permissions') ?: $this->getDefaultPermissionsConfig();

        // Definir roles con sus permisos
        $roles = [
            [
                'name' => 'Administrador del Sistema',
                'slug' => 'administrador',
                'description' => 'Usuario con acceso completo a todas las funcionalidades del sistema',
                'permissions' => $this->getAllPermissions($permissionsConfig),
                'is_active' => true,
            ],
            [
                'name' => 'Gerente General',
                'slug' => 'gerente',
                'description' => 'Usuario con acceso a la mayoría de funcionalidades, excepto configuración del sistema',
                'permissions' => $this->getManagerPermissions($permissionsConfig),
                'is_active' => true,
            ],
            [
                'name' => 'Especialista Comercial',
                'slug' => 'comercial',
                'description' => 'Usuario con acceso a funcionalidades comerciales y de proyectos',
                'permissions' => $this->getCommercialPermissions($permissionsConfig),
                'is_active' => true,
            ],
            [
                'name' => 'Contador General',
                'slug' => 'contador',
                'description' => 'Usuario con acceso a funcionalidades financieras y reportes',
                'permissions' => $this->getAccountantPermissions($permissionsConfig),
                'is_active' => true,
            ],
            [
                'name' => 'Ingeniero de Proyectos',
                'slug' => 'ingeniero',
                'description' => 'Usuario con acceso a proyectos, tareas y soporte técnico',
                'permissions' => $this->getEngineerPermissions($permissionsConfig),
                'is_active' => true,
            ],
            [
                'name' => 'Técnico Especialista',
                'slug' => 'tecnico',
                'description' => 'Usuario con acceso limitado a tareas e inventario',
                'permissions' => $this->getTechnicianPermissions($permissionsConfig),
                'is_active' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );
            echo "Created/Updated role: {$roleData['name']}\n";
        }

        echo "Roles seeded successfully!\n";
    }

    /**
     * Obtener todos los permisos para administrador
     */
    private function getAllPermissions($config)
    {
        $allPermissions = [];
        foreach ($config as $module => $permissions) {
            $allPermissions = array_merge($allPermissions, array_values($permissions));
        }
        return array_unique($allPermissions);
    }

    /**
     * Obtener permisos para gerente
     */
    private function getManagerPermissions($config)
    {
        return array_merge(
            array_values($config['users'] ?? []),
            array_values($config['projects'] ?? []),
            array_values($config['tasks'] ?? []),
            array_values($config['inventory'] ?? []),
            array_values($config['support'] ?? []),
            array_values($config['financial'] ?? []),
            array_values($config['commercial'] ?? []),
            array_values($config['reports'] ?? [])
        );
    }

    /**
     * Obtener permisos para comercial
     */
    private function getCommercialPermissions($config)
    {
        return array_merge(
            array_values($config['projects'] ?? []),
            array_values($config['commercial'] ?? []),
            array_values($config['reports'] ?? []),
            [$config['users']['read'], $config['tasks']['read'], $config['inventory']['read']]
        );
    }

    /**
     * Obtener permisos para contador
     */
    private function getAccountantPermissions($config)
    {
        return array_merge(
            array_values($config['financial'] ?? []),
            array_values($config['reports'] ?? []),
            [$config['users']['read'], $config['projects']['read']]
        );
    }

    /**
     * Obtener permisos para ingeniero
     */
    private function getEngineerPermissions($config)
    {
        return array_merge(
            array_values($config['projects'] ?? []),
            array_values($config['tasks'] ?? []),
            array_values($config['support'] ?? []),
            [$config['inventory']['read'], $config['users']['read'], $config['reports']['read']]
        );
    }

    /**
     * Obtener permisos para técnico
     */
    private function getTechnicianPermissions($config)
    {
        return [
            $config['tasks']['read'],
            $config['tasks']['update'],
            $config['inventory']['read'],
            $config['support']['read'],
            $config['users']['read'],
        ];
    }

    /**
     * Configuración por defecto de permisos
     */
    private function getDefaultPermissionsConfig()
    {
        return [
            'users' => [
                'create' => 'users.create',
                'read' => 'users.read',
                'update' => 'users.update',
                'delete' => 'users.delete',
            ],
            'roles' => [
                'create' => 'roles.create',
                'read' => 'roles.read',
                'update' => 'roles.update',
                'delete' => 'roles.delete',
            ],
            'projects' => [
                'create' => 'projects.create',
                'read' => 'projects.read',
                'update' => 'projects.update',
                'delete' => 'projects.delete',
            ],
            'tasks' => [
                'create' => 'tasks.create',
                'read' => 'tasks.read',
                'update' => 'tasks.update',
                'delete' => 'tasks.delete',
            ],
            'inventory' => [
                'create' => 'inventory.create',
                'read' => 'inventory.read',
                'update' => 'inventory.update',
                'delete' => 'inventory.delete',
            ],
            'support' => [
                'create' => 'support.create',
                'read' => 'support.read',
                'update' => 'support.update',
                'delete' => 'support.delete',
            ],
            'financial' => [
                'read' => 'financial.read',
                'update' => 'financial.update',
                'reports' => 'financial.reports',
            ],
            'commercial' => [
                'read' => 'commercial.read',
                'update' => 'commercial.update',
                'reports' => 'commercial.reports',
            ],
            'settings' => [
                'read' => 'settings.read',
                'update' => 'settings.update',
            ],
            'reports' => [
                'create' => 'reports.create',
                'read' => 'reports.read',
                'update' => 'reports.update',
                'delete' => 'reports.delete',
            ],
        ];
    }
}
