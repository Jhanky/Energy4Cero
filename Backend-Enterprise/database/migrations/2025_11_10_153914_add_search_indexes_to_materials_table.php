<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('materials')) {
            Schema::table('materials', function (Blueprint $table) {
                // Add indexes for search performance optimization
                $table->index('product_id');
                $table->index('category');
                $table->index('warehouse_id');
                $table->index('is_active');
                // For TEXT columns in MySQL, we create a partial index with key length
                DB::statement('ALTER TABLE materials ADD INDEX materials_description_index (description(255))');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex(['product_id']);
            $table->dropIndex(['description']);
            $table->dropIndex(['category']);
            $table->dropIndex(['warehouse_id']);
            $table->dropIndex(['is_active']);
        });
    }
};
