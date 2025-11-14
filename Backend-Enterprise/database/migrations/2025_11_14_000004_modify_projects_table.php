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
        // Combined migration - no changes needed as individual migrations already executed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Reverse add_cost_center_id_to_projects_table
            $table->dropForeign(['cost_center_id']);
            $table->dropColumn('cost_center_id');

            // Reverse add_quotation_id_to_projects_table
            $table->dropForeign(['quotation_id']);
            $table->dropColumn('quotation_id');
        });

        // Reverse create_projects_table
        Schema::dropIfExists('projects');
    }
};
