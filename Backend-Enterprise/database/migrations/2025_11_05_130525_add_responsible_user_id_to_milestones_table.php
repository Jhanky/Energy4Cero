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
            // Añadir el campo responsible_user_id para almacenar el ID de usuario responsable
            $table->unsignedBigInteger('responsible_user_id')->nullable()->after('responsible');
            
            // Agregar la clave foránea
            $table->foreign('responsible_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropForeign(['responsible_user_id']);
            $table->dropColumn('responsible_user_id');
        });
    }
};
