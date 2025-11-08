<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('project_state_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id'); // Proyecto asociado
            $table->unsignedBigInteger('from_state_id')->nullable(); // Estado anterior
            $table->unsignedBigInteger('to_state_id'); // Estado nuevo
            $table->text('reason')->nullable(); // Razón del cambio de estado
            $table->string('changed_by')->nullable(); // Quién realizó el cambio
            $table->timestamp('changed_at')->nullable(); // Cuándo se realizó el cambio
            $table->json('additional_data')->nullable(); // Datos adicionales (como fechas específicas)
            $table->timestamps();
        });
        
        // Definir llaves foráneas después de crear la tabla para evitar problemas
        Schema::table('project_state_history', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('from_state_id')->references('id')->on('project_states')->onDelete('set null');
            $table->foreign('to_state_id')->references('id')->on('project_states')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('project_state_history');
    }
};