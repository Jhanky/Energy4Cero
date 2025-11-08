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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id('invoice_id');
            $table->foreignId('supplier_id')->constrained('suppliers', 'supplier_id')->onDelete('cascade');
            $table->foreignId('cost_center_id')->constrained('cost_centers', 'cost_center_id')->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->decimal('amount_before_iva', 15, 2);
            $table->decimal('total_value', 15, 2);
            $table->enum('status', ['pendiente', 'pagada', 'anulada'])->default('pendiente');
            $table->enum('payment_type', ['parcial', 'total'])->default('total');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('file_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
            $table->index(['cost_center_id', 'status']);
            $table->index('issue_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
