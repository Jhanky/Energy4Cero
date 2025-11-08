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
        Schema::table('milestones', function (Blueprint $table) {
            // Eliminar el campo state
            $table->dropColumn('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            // Restaurar el campo state (enum con los valores anteriores)
            $table->enum('state', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
        });
    }
};
