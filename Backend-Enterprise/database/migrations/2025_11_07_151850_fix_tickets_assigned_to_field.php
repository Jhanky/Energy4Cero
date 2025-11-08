<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Renombrar technicians_assigned a assigned_to si assigned_to no existe
        Schema::table('tickets', function (Blueprint $table) {
            if (Schema::hasColumn('tickets', 'technicians_assigned') && !Schema::hasColumn('tickets', 'assigned_to')) {
                // Renombrar la columna technicians_assigned a assigned_to
                $table->renameColumn('technicians_assigned', 'assigned_to');
            } elseif (!Schema::hasColumn('tickets', 'assigned_to')) {
                // Si no existe assigned_to, crearla
                $table->unsignedBigInteger('assigned_to')->nullable()->after('status_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            if (Schema::hasColumn('tickets', 'assigned_to')) {
                // Si assigned_to fue renombrada desde technicians_assigned, revertir
                // En caso contrario, eliminar la nueva columna
                if (!Schema::hasColumn('tickets', 'technicians_assigned')) {
                    $table->renameColumn('assigned_to', 'technicians_assigned');
                } else {
                    $table->dropColumn('assigned_to');
                }
            }
        });
    }
};
