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
        Schema::create('quotation_statuses', function (Blueprint $table) {
            $table->id('status_id');
            $table->string('name', 50);
            $table->text('description')->nullable();
            $table->string('color', 20)->default('#3b82f6'); // Default blue color
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_statuses');
    }
};