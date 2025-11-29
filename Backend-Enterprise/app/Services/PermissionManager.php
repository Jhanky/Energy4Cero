<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Collection;

class PermissionManager
{
    /**
     * Obtener todos los permisos disponibles desde la base de datos
     *
     * @return array
     */
    public function getAllPermissions(): array
    {
        return Permission::getGroupedByModule()->toArray();
    }

    /**
     * Obtener permisos agrupados por módulo
     *
     * @return array
     */
    public function getPermissionsByModule(): array
    {
        $permissions = $this->getAllPermissions();

        $grouped = [];
        foreach ($permissions as $module => $modulePermissions) {
            $grouped[$module] = [];
            foreach ($modulePermissions as $permission) {
                $grouped[$module][] = [
                    'key' => $permission['key'],
                    'action' => $permission['action'],
                    'label' => $permission['label'],
                    'id' => $permission['id'],
                    'description' => $permission['description'],
                ];
            }
        }

        return $grouped;
    }

    /**
     * Obtener permisos de un módulo específico
     *
     * @param string $module
     * @return array
     */
    public function getPermissionsByModuleName(string $module): array
    {
        $permissions = $this->getAllPermissions();
        $modulePermissions = $permissions[$module] ?? [];

        // Convertir a formato de array simple con las keys de permisos
        return array_map(function ($permission) {
            return $permission['key'];
        }, $modulePermissions);
    }

    /**
     * Obtener lista de módulos disponibles
     *
     * @return array
     */
    public function getModules(): array
    {
        return array_keys($this->getAllPermissions());
    }

    /**
     * Verificar si un usuario tiene un permiso específico
     *
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function hasPermission(User $user, string $permission): bool
    {
        return $user->hasPermission($permission);
    }

    /**
     * Obtener todos los permisos de un usuario
     *
     * @param User $user
     * @return array
     */
    public function getUserPermissions(User $user): array
    {
        return $user->getAllPermissions();
    }

    /**
     * Verificar si un rol tiene un permiso específico
     *
     * @param Role $role
     * @param string $permission
     * @return bool
     */
    public function roleHasPermission(Role $role, string $permission): bool
    {
        return $role->hasPermission($permission);
    }

    /**
     * Obtener todos los permisos de un rol
     *
     * @param Role $role
     * @return array
     */
    public function getRolePermissions(Role $role): array
    {
        return $role->permissions ?? [];
    }

    /**
     * Validar que una lista de permisos existen en la configuración
     *
     * @param array $permissions
     * @return array
     */
    public function validatePermissions(array $permissions): array
    {
        $allPermissions = $this->getAllPermissions();
        $flatPermissions = $this->flattenPermissions($allPermissions);

        $valid = [];
        $invalid = [];

        foreach ($permissions as $permission) {
            if (in_array($permission, $flatPermissions)) {
                $valid[] = $permission;
            } else {
                $invalid[] = $permission;
            }
        }

        return [
            'valid' => $valid,
            'invalid' => $invalid,
            'is_valid' => empty($invalid)
        ];
    }

    /**
     * Aplanar la estructura de permisos para validación
     *
     * @param array $permissions
     * @return array
     */
    private function flattenPermissions(array $permissions): array
    {
        $flat = [];

        foreach ($permissions as $module => $modulePermissions) {
            foreach ($modulePermissions as $permission) {
                $flat[] = $permission['key'];
            }
        }

        return $flat;
    }

    /**
     * Obtener etiqueta legible para un permiso
     *
     * @param string $permissionKey
     * @return string
     */
    public function getPermissionLabel(string $permissionKey): string
    {
        $labels = [
            // Usuarios
            'users.read' => 'Ver usuarios',
            'users.create' => 'Crear usuarios',
            'users.update' => 'Editar usuarios',
            'users.delete' => 'Eliminar usuarios',
            'users.manage_roles' => 'Gestionar roles de usuarios',

            // Roles
            'roles.read' => 'Ver roles',
            'roles.create' => 'Crear roles',
            'roles.update' => 'Editar roles',
            'roles.delete' => 'Eliminar roles',

            // Clientes
            'clients.read' => 'Ver clientes',
            'clients.create' => 'Crear clientes',
            'clients.update' => 'Editar clientes',
            'clients.delete' => 'Eliminar clientes',

            // Cotizaciones
            'quotations.read' => 'Ver cotizaciones',
            'quotations.create' => 'Crear cotizaciones',
            'quotations.update' => 'Editar cotizaciones',
            'quotations.delete' => 'Eliminar cotizaciones',

            // Proyectos
            'projects.read' => 'Ver proyectos',
            'projects.create' => 'Crear proyectos',
            'projects.update' => 'Editar proyectos',
            'projects.delete' => 'Eliminar proyectos',

            // Paneles
            'panels.read' => 'Ver paneles',
            'panels.create' => 'Crear paneles',
            'panels.update' => 'Editar paneles',
            'panels.delete' => 'Eliminar paneles',

            // Inversores
            'inverters.read' => 'Ver inversores',
            'inverters.create' => 'Crear inversores',
            'inverters.update' => 'Editar inversores',
            'inverters.delete' => 'Eliminar inversores',

            // Baterías
            'batteries.read' => 'Ver baterías',
            'batteries.create' => 'Crear baterías',
            'batteries.update' => 'Editar baterías',
            'batteries.delete' => 'Eliminar baterías',

            // Inventario
            'inventory.read' => 'Ver inventario',
            'inventory.create' => 'Crear elementos de inventario',
            'inventory.update' => 'Editar inventario',
            'inventory.delete' => 'Eliminar elementos de inventario',

            // Soporte
            'support.read' => 'Ver tickets de soporte',
            'support.create' => 'Crear tickets de soporte',
            'support.update' => 'Editar tickets de soporte',
            'support.delete' => 'Eliminar tickets de soporte',

            // Comercial
            'commercial.read' => 'Ver datos comerciales',
            'commercial.update' => 'Editar datos comerciales',
        ];

        return $labels[$permissionKey] ?? ucfirst(str_replace(['.', '_'], [' ', ' '], $permissionKey));
    }

    /**
     * Obtener permisos por módulo con etiquetas
     *
     * @return array
     */
    public function getPermissionsWithLabels(): array
    {
        $permissions = $this->getPermissionsByModule();
        $withLabels = [];

        foreach ($permissions as $module => $modulePermissions) {
            $withLabels[$module] = array_map(function ($permission) {
                return [
                    'key' => $permission['key'],
                    'label' => $permission['label']
                ];
            }, $modulePermissions);
        }

        return $withLabels;
    }

    /**
     * Verificar si un permiso pertenece a un módulo
     *
     * @param string $permission
     * @param string $module
     * @return bool
     */
    public function permissionBelongsToModule(string $permission, string $module): bool
    {
        $modulePermissions = $this->getPermissionsByModuleName($module);
        return in_array($permission, $modulePermissions);
    }

    /**
     * Obtener módulo de un permiso
     *
     * @param string $permission
     * @return string|null
     */
    public function getModuleFromPermission(string $permission): ?string
    {
        $permissions = $this->getAllPermissions();

        foreach ($permissions as $module => $modulePermissions) {
            foreach ($modulePermissions as $modulePermission) {
                if ($modulePermission['key'] === $permission) {
                    return $module;
                }
            }
        }

        return null;
    }
}
