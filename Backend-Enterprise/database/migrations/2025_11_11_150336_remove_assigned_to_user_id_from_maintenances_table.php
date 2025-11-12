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
            $table->dropColumn('assigned_to_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            // Restaurar la columna
            $table->unsignedBigInteger('assigned_to_user_id')->nullable()->after('created_by_user_id');

            // Restaurar la foreign key
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->onDelete('set null');

            // Restaurar el índice
            $table->index(['assigned_to_user_id']);
        });
    }
};
