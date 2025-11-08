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
        Schema::create('ticket_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id')->nullable(); // Relación con el ticket (puede ser nulo temporalmente)
            $table->unsignedBigInteger('user_id'); // Usuario que hizo el comentario
            $table->text('comment'); // Texto del comentario
            $table->json('metadata')->nullable(); // Datos adicionales (ubicación, imágenes tomadas, etc.)
            $table->boolean('is_internal')->default(false); // Si es comentario interno (visible solo para técnicos)
            $table->timestamps(); // Fecha de creación y actualización
            $table->softDeletes(); // Soft deletes para mantener histórico
            
            // Índices para mejorar búsquedas
            $table->index(['ticket_id']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ticket_comments');
    }
};