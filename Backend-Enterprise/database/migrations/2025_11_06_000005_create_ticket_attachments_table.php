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
        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id')->nullable(); // Relación con el ticket (puede ser nulo temporalmente)
            $table->string('original_name'); // Nombre original del archivo
            $table->string('stored_name'); // Nombre único almacenado en el servidor
            $table->string('file_path'); // Ruta donde se almacena el archivo
            $table->string('mime_type'); // Tipo MIME del archivo
            $table->bigInteger('file_size'); // Tamaño del archivo en bytes
            $table->string('file_type'); // Tipo del archivo (imagen, pdf, etc.)
            $table->unsignedBigInteger('uploaded_by')->nullable(); // Usuario que subió el archivo
            $table->string('description')->nullable(); // Descripción opcional del archivo
            $table->boolean('is_public')->default(true); // Si el archivo es público o privado
            $table->json('metadata')->nullable(); // Metadatos adicionales
            $table->timestamps();
            $table->softDeletes(); // Soft deletes para mantener histórico
            
            // Índices para mejorar búsquedas
            $table->index(['ticket_id']);
            $table->index(['uploaded_by']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ticket_attachments');
    }
};