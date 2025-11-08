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
        // Actualizar permisos de roles existentes en lugar de crear nuevos
        $roleUpdates = [
            'administrador' => [
                'support.create',
                'support.read',
                'support.update',
                'support.delete',
            ],
            'gerente' => [
                'support.create',
                'support.read',
                'support.update',
            ],
            'ingeniero' => [
                'support.create',
                'support.read',
                'support.update',
            ],
        ];

        foreach ($roleUpdates as $slug => $newPermissions) {
            $role = Role::where('slug', $slug)->first();
            if ($role) {
                $currentPermissions = $role->permissions ?? [];
                $updatedPermissions = array_unique(array_merge($currentPermissions, $newPermissions));
                $role->update(['permissions' => $updatedPermissions]);
                echo "Updated permissions for role: {$role->name}\n";
            } else {
                echo "Role not found: {$slug}\n";
            }
        }

        echo "Role permissions updated successfully!\n";
    }
}
