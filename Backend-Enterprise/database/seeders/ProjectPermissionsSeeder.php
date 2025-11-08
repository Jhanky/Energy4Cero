<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class ProjectPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure all project management permissions are added to existing roles
        $projectsPermissions = [
            'projects.create',
            'projects.read', 
            'projects.update',
            'projects.delete',
        ];

        // Get all roles and update their permissions
        $roles = Role::all();

        foreach ($roles as $role) {
            $permissions = $role->permissions ?? [];
            
            // Add project management permissions if they don't exist
            foreach ($projectsPermissions as $permission) {
                if (!in_array($permission, $permissions)) {
                    $permissions[] = $permission;
                }
            }
            
            $role->permissions = $permissions;
            $role->save();
        }
    }
}