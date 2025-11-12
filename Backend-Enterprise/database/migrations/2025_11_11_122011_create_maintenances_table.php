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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id('maintenance_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['preventive', 'corrective', 'predictive', 'condition_based'])->default('preventive');
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'custom'])->default('monthly');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'])->default('scheduled');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');

            // Scheduling
            $table->date('scheduled_date');
            $table->date('next_due_date')->nullable();
            $table->date('last_completed_date')->nullable();
            $table->integer('estimated_duration_hours')->nullable();

            // Relations
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('created_by_user_id');
            $table->unsignedBigInteger('assigned_to_user_id')->nullable();

            // Additional info
            $table->json('custom_schedule')->nullable(); // For custom frequencies
            $table->text('notes')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->foreign('created_by_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['status', 'scheduled_date']);
            $table->index(['project_id']);
            $table->index(['assigned_to_user_id']);
            $table->index(['next_due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
