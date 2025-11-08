<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener los roles existentes
        $adminRole = DB::table('roles')->where('slug', 'administrador')->first();
        $managerRole = DB::table('roles')->where('slug', 'gerente')->first();
        $engineerRole = DB::table('roles')->where('slug', 'ingeniero')->first();
        
        // Actualizar permisos para el rol de administrador
        if ($adminRole) {
            $adminPermissions = json_decode($adminRole->permissions, true) ?? [];
            $taskPermissions = [
                'tasks.create',
                'tasks.read',
                'tasks.update',
                'tasks.delete'
            ];
            
            foreach ($taskPermissions as $permission) {
                if (!in_array($permission, $adminPermissions)) {
                    $adminPermissions[] = $permission;
                }
            }
            
            DB::table('roles')
                ->where('role_id', $adminRole->role_id)
                ->update(['permissions' => json_encode($adminPermissions)]);
        }
        
        // Actualizar permisos para el rol de gerente
        if ($managerRole) {
            $managerPermissions = json_decode($managerRole->permissions, true) ?? [];
            $taskPermissions = [
                'tasks.create',
                'tasks.read',
                'tasks.update'
            ];
            
            foreach ($taskPermissions as $permission) {
                if (!in_array($permission, $managerPermissions)) {
                    $managerPermissions[] = $permission;
                }
            }
            
            DB::table('roles')
                ->where('role_id', $managerRole->role_id)
                ->update(['permissions' => json_encode($managerPermissions)]);
        }
        
        // Actualizar permisos para el rol de ingeniero
        if ($engineerRole) {
            $engineerPermissions = json_decode($engineerRole->permissions, true) ?? [];
            $taskPermissions = [
                'tasks.create',
                'tasks.read',
                'tasks.update'
            ];
            
            foreach ($taskPermissions as $permission) {
                if (!in_array($permission, $engineerPermissions)) {
                    $engineerPermissions[] = $permission;
                }
            }
            
            DB::table('roles')
                ->where('role_id', $engineerRole->role_id)
                ->update(['permissions' => json_encode($engineerPermissions)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Quitar los permisos de tareas de los roles
        $roles = DB::table('roles')
            ->whereIn('slug', ['administrador', 'gerente', 'ingeniero'])
            ->get();
        
        foreach ($roles as $role) {
            $permissions = json_decode($role->permissions, true) ?? [];
            $permissions = array_filter($permissions, function($permission) {
                return !str_starts_with($permission, 'tasks.');
            });
            
            DB::table('roles')
                ->where('role_id', $role->role_id)
                ->update(['permissions' => json_encode(array_values($permissions))]);
        }
    }
};