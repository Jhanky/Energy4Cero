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
        Schema::table('milestones', function (Blueprint $table) {
            // Reverse remove_state_field_from_milestones_table
            $table->enum('state', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');

            // Reverse remove_responsible_field_from_milestones_table
            $table->string('responsible')->nullable()->after('description');

            // Reverse update_responsible_field_in_milestones_table
            $table->string('responsible')->nullable(false)->change();

            // Reverse add_responsible_user_id_to_milestones_table
            $table->dropForeign(['responsible_user_id']);
            $table->dropColumn('responsible_user_id');
        });

        // Reverse create_milestones_table
        Schema::dropIfExists('milestones');
    }
};
