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
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('quotation_id');
            $table->string('description', 255);
            $table->string('item_type', 50);
            $table->decimal('quantity', 8, 2);
            $table->string('unit', 20);
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
        Schema::dropIfExists('quotation_items');
    }
};
