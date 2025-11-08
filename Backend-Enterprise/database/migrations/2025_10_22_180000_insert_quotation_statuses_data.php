<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insertar estados iniciales para las cotizaciones
        DB::table('quotation_statuses')->insert([
            [
                'name' => 'Borrador',
                'description' => 'Cotización en elaboración',
                'color' => '#9ca3af',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Enviada',
                'description' => 'Cotización enviada al cliente',
                'color' => '#3b82f6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Pendiente',
                'description' => 'Esperando respuesta del cliente',
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Aceptada',
                'description' => 'Cotización aceptada por el cliente',
                'color' => '#10b981',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Rechazada',
                'description' => 'Cotización rechazada por el cliente',
                'color' => '#ef4444',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Contratada',
                'description' => 'Cotización convertida en contrato',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('quotation_statuses')->where('name', 'Borrador')->delete();
        DB::table('quotation_statuses')->where('name', 'Enviada')->delete();
        DB::table('quotation_statuses')->where('name', 'Pendiente')->delete();
        DB::table('quotation_statuses')->where('name', 'Aceptada')->delete();
        DB::table('quotation_statuses')->where('name', 'Rechazada')->delete();
        DB::table('quotation_statuses')->where('name', 'Contratada')->delete();
    }
};