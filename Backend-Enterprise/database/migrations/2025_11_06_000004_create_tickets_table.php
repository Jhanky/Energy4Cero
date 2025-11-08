<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique(); // Código único del ticket (TK-YYYY-XXXX)
            $table->unsignedBigInteger('project_id')->nullable(); // ID del proyecto (puede ser nulo temporalmente)
            $table->unsignedBigInteger('client_id')->nullable(); // ID del cliente (puede ser nulo temporalmente)
            $table->string('title'); // Título del ticket
            $table->text('description'); // Descripción del ticket
            $table->unsignedBigInteger('type_id'); // Tipo de ticket
            $table->unsignedBigInteger('priority_id'); // Prioridad del ticket
            $table->unsignedBigInteger('status_id'); // Estado del ticket
            $table->text('technicians_assigned')->nullable(); // Técnicos asignados (almacenados como JSON o separados por comas)
            $table->unsignedBigInteger('created_by'); // Quién creó el ticket
            $table->dateTime('due_date')->nullable(); // Fecha límite de resolución
            $table->dateTime('resolution_date')->nullable(); // Fecha de resolución
            $table->integer('sla_hours')->nullable(); // Horas de SLA para resolver
            $table->json('metadata')->nullable(); // Metadatos adicionales
            $table->timestamps();
            $table->softDeletes(); // Soft deletes para mantener histórico
            
            // Definir índices para mejorar el rendimiento
            $table->index(['project_id']);
            $table->index(['client_id']);
            $table->index(['type_id']);
            $table->index(['priority_id']);
            $table->index(['status_id']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tickets');
    }
};