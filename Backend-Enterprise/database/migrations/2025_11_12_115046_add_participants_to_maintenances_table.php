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
        Schema::table('maintenances', function (Blueprint $table) {
            // Agregar campo participants
            $table->json('participants')->nullable()->after('created_by_user_id');

            // Eliminar columnas no utilizadas
            $table->dropColumn(['next_due_date', 'estimated_duration_hours', 'custom_schedule']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            // Restaurar columnas eliminadas
            $table->date('next_due_date')->nullable()->after('scheduled_date');
            $table->integer('estimated_duration_hours')->nullable()->after('last_completed_date');
            $table->json('custom_schedule')->nullable()->after('estimated_cost');

            // Eliminar campo participants
            $table->dropColumn('participants');
        });
    }
};
