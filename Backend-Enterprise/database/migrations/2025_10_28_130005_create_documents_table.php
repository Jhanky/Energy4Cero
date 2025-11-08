<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Código único del documento (ej: DOC-001-01)
            $table->string('name'); // Nombre del archivo
            $table->string('original_name'); // Nombre original del archivo
            $table->string('path'); // Ruta del archivo en el servidor
            $table->string('mime_type'); // Tipo MIME
            $table->bigInteger('size'); // Tamaño en bytes
            $table->string('extension'); // Extensión del archivo
            $table->text('description')->nullable(); // Descripción del documento
            $table->unsignedBigInteger('type_id'); // Tipo de documento
            $table->string('responsible'); // Responsable de subida
            $table->date('date')->nullable(); // Fecha del documento
            $table->unsignedBigInteger('project_id')->nullable(); // Proyecto asociado
            $table->unsignedBigInteger('milestone_id')->nullable(); // Hito asociado
            $table->boolean('is_public')->default(false); // Si es visible para el cliente
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable(); // Usuario que creó el documento
            $table->unsignedBigInteger('updated_by')->nullable(); // Usuario que actualizó el documento
            $table->timestamps();
            $table->softDeletes();
        });
        
        // Definir llaves foráneas después de crear la tabla para evitar problemas
        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('type_id')->references('id')->on('document_types')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('milestone_id')->references('id')->on('milestones')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};