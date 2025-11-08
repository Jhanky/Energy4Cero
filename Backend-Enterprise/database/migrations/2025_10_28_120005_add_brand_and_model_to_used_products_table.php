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
        Schema::table('used_products', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('product_type');
            $table->string('model')->nullable()->after('brand');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('used_products', function (Blueprint $table) {
            $table->dropColumn(['brand', 'model']);
        });
    }
};