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
        Schema::create('batteries', function (Blueprint $table) {
            $table->id('battery_id');
            $table->string('name')->unique();
            $table->string('model')->unique();
            $table->string('brand');
            $table->string('type');
            $table->decimal('price', 10, 2);
            $table->decimal('ah_capacity', 8, 2);
            $table->decimal('voltage', 8, 2);
            $table->string('technical_sheet_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batteries');
    }
};
