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
        // Obtener el rol de técnico
        $technicianRole = DB::table('roles')->where('slug', 'tecnico')->first();
        
        if ($technicianRole) {
            $technicianPermissions = json_decode($technicianRole->permissions, true) ?? [];
            $taskReadPermission = 'tasks.read';
            
            // Agregar permiso de lectura de tareas si no existe
            if (!in_array($taskReadPermission, $technicianPermissions)) {
                $technicianPermissions[] = $taskReadPermission;
                
                DB::table('roles')
                    ->where('role_id', $technicianRole->role_id)
                    ->update(['permissions' => json_encode($technicianPermissions)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Quitar el permiso de tareas del rol de técnico
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
    }
};