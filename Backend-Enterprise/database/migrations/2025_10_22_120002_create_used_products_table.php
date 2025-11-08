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
        Schema::create('used_products', function (Blueprint $table) {
            $table->id('used_product_id');
            $table->unsignedBigInteger('quotation_id');
            $table->enum('product_type', ['panel', 'inverter', 'battery']);
            $table->unsignedBigInteger('product_id');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('profit_percentage', 5, 3)->default(0);
            $table->decimal('partial_value', 14, 2)->default(0);
            $table->decimal('profit', 14, 2)->default(0);
            $table->decimal('total_value', 14, 2)->default(0);
            $table->timestamps();

            $table->foreign('quotation_id')->references('quotation_id')->on('quotations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('used_products');
    }
};