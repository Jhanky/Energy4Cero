<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Código único del hito (ej: H-001-01)
            $table->unsignedBigInteger('project_id'); // Proyecto asociado
            $table->unsignedBigInteger('type_id'); // Tipo de hito
            $table->date('date'); // Fecha del hito
            $table->string('title'); // Título del hito
            $table->text('description'); // Descripción del hito
            $table->string('responsible'); // Responsable del hito
            $table->json('participants')->nullable(); // Participantes (array JSON)
            $table->text('notes')->nullable(); // Notas adicionales
            $table->enum('state', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending'); // Estado del hito
            $table->integer('order')->nullable(); // Orden para mostrar en el timeline
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable(); // Usuario que creó el hito
            $table->unsignedBigInteger('updated_by')->nullable(); // Usuario que actualizó el hito
            $table->timestamps();
            $table->softDeletes();
        });
        
        // Definir llaves foráneas después de crear la tabla para evitar problemas
        Schema::table('milestones', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('type_id')->references('id')->on('milestone_types')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('milestones');
    }
};