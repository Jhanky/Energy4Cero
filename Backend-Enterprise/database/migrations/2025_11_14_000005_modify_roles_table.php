<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Combined migration - no changes needed as individual migrations already executed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse add_task_read_permission_to_technician_role
        $technicianRole = DB::table('roles')->where('slug', 'tecnico')->first();
        
        if ($technicianRole) {
            $permissions = json_decode($technicianRole->permissions, true) ?? [];
            $permissions = array_filter($permissions, function($permission) {
                return $permission !== 'tasks.read';
            });
            
            DB::table('roles')
                ->where('role_id', $technicianRole->role_id)
                ->update(['permissions' => json_encode(array_values($permissions))]);
        }

        // Reverse add_task_permissions_to_roles_table
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

        // Reverse create_roles_table
        Schema::dropIfExists('roles');
    }
};
