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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('module', 100); // Ej: 'users', 'roles', 'clients'
            $table->string('action', 100); // Ej: 'create', 'read', 'update', 'delete'
            $table->string('key', 255)->unique(); // Ej: 'users.create', 'roles.read'
            $table->string('label', 255); // Ej: 'Crear usuarios', 'Ver roles'
            $table->text('description')->nullable(); // Descripción opcional del permiso
            $table->boolean('is_active')->default(true); // Permiso activo/inactivo
            $table->timestamps();

            // Índices para optimización
            $table->index(['module', 'is_active']);
            $table->index('key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
