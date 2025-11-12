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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('product_id')->unique(); // ID_Producto
            $table->text('description'); // Descripción
            $table->decimal('quantity', 10, 2)->default(0); // Cantidad
            $table->string('unit_measure'); // Unidad/Medida
            $table->string('category'); // Categoría
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null'); // Ubicación (FK a warehouses)
            $table->text('notes')->nullable(); // Notas
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para mejor rendimiento
            $table->index(['category', 'is_active']);
            $table->index(['warehouse_id', 'is_active']);
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
