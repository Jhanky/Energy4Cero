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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id('quotation_id');
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('user_id');
            $table->string('project_name', 200);
            $table->enum('system_type', ['On-grid', 'Off-grid', 'Híbrido', 'Interconectado']);
            $table->decimal('power_kwp', 8, 2); // Potencia en kWp
            $table->integer('panel_count'); // Número de paneles
            $table->boolean('requires_financing')->default(false);
            $table->decimal('profit_percentage', 5, 3)->default(0.000); // Porcentaje de ganancia general
            $table->decimal('iva_profit_percentage', 5, 3)->default(0.190); // Porcentaje de IVA sobre ganancia
            $table->decimal('commercial_management_percentage', 5, 3)->default(0.000); // % Gestión comercial
            $table->decimal('administration_percentage', 5, 3)->default(0.000); // % Administración
            $table->decimal('contingency_percentage', 5, 3)->default(0.000); // % Contingencia
            $table->decimal('withholding_percentage', 5, 3)->default(0.000); // % Retenciones
            
            // Campos calculados
            $table->decimal('subtotal', 14, 2)->default(0.00);
            $table->decimal('profit', 14, 2)->default(0.00);
            $table->decimal('profit_iva', 14, 2)->default(0.00);
            $table->decimal('commercial_management', 14, 2)->default(0.00);
            $table->decimal('administration', 14, 2)->default(0.00);
            $table->decimal('contingency', 14, 2)->default(0.00);
            $table->decimal('withholdings', 14, 2)->default(0.00);
            $table->decimal('total_value', 14, 2)->default(0.00);
            $table->decimal('subtotal2', 14, 2)->default(0.00); // Subtotal + gestión comercial
            $table->decimal('subtotal3', 14, 2)->default(0.00); // Subtotal2 + admin + imp + util
            
            $table->unsignedBigInteger('status_id')->default(1); // Estado por defecto (Borrador)
            $table->timestamps();

            // Foreign Keys - Asumiendo que tanto clients como quotation_statuses usan IDs personalizados
            $table->foreign('client_id')->references('client_id')->on('clients')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('status_id')->references('status_id')->on('quotation_statuses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};