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
        Schema::table('maintenances', function (Blueprint $table) {
            // Reverse remove_estimated_cost_from_maintenances_table
            $table->decimal('estimated_cost', 10, 2)->nullable()->after('notes');

            // Reverse add_participants_to_maintenances_table
            $table->dropColumn('participants');
            $table->date('next_due_date')->nullable()->after('scheduled_date');
            $table->integer('estimated_duration_hours')->nullable()->after('last_completed_date');
            $table->json('custom_schedule')->nullable()->after('estimated_cost');

            // Reverse remove_frequency_from_maintenances_table
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'custom'])->default('monthly');

            // Reverse remove_assigned_to_user_id_from_maintenances_table
            $table->unsignedBigInteger('assigned_to_user_id')->nullable()->after('created_by_user_id');
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['assigned_to_user_id']);
        });

        // Reverse create_maintenance_evidences_table and create_maintenances_table
        Schema::dropIfExists('maintenance_evidences');
        Schema::dropIfExists('maintenances');
    }
};
