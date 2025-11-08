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
        Schema::create('inverters', function (Blueprint $table) {
            $table->id('inverter_id');
            $table->string('name')->unique();
            $table->string('model')->unique();
            $table->string('brand');
            $table->decimal('power_output_kw', 8, 2);
            $table->string('grid_type');
            $table->string('system_type');
            $table->decimal('price', 10, 2);
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
        Schema::dropIfExists('inverters');
    }
};
