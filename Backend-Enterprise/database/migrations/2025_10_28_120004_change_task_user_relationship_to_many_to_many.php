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
        // Eliminar la columna assigned_to_user_id de la tabla tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['assigned_to_user_id']);
            $table->dropColumn('assigned_to_user_id');
        });

        // Crear tabla intermedia para la relación muchos a muchos entre tareas y usuarios
        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            // Definir claves foráneas
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Asegurar que no haya duplicados
            $table->unique(['task_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla intermedia
        Schema::dropIfExists('task_user');

        // Volver a agregar la columna assigned_to_user_id
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_to_user_id');
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};