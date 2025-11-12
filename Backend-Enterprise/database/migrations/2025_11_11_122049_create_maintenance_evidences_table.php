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
        Schema::create('maintenance_evidences', function (Blueprint $table) {
            $table->id('evidence_id');
            $table->unsignedBigInteger('maintenance_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();

            // Foreign keys
            $table->foreign('maintenance_id')->references('maintenance_id')->on('maintenances')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index(['maintenance_id']);
            $table->index(['uploaded_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_evidences');
    }
};
