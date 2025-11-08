<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear proveedor de prueba
        DB::table('suppliers')->insert([
            'supplier_id' => 1,
            'name' => 'Proveedor Demo S.A.S.',
            'supplier_type' => 'empresa',
            'email' => 'contacto@proveedordemo.com',
            'phone' => '3001234567',
            'nit' => '901234567-1',
            'address' => 'Calle 123 #45-67, Bogotá',
            'notes' => 'Proveedor de prueba - Términos de pago: 30 días',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Crear centro de costos de prueba
        DB::table('cost_centers')->insert([
            'cost_center_id' => 1,
            'name' => 'Centro de Costos Principal',
            'code' => 'CCP001',
            'description' => 'Centro de costos principal para operaciones generales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Crear una factura de prueba
        DB::table('invoices')->insert([
            'supplier_id' => 1,
            'cost_center_id' => 1,
            'invoice_number' => 'FAC-DEMO-001',
            'amount_before_iva' => 1000000.00,
            'total_value' => 1190000.00,
            'status' => 'pendiente',
            'payment_type' => 'total',
            'issue_date' => now()->subDays(5),
            'due_date' => now()->addDays(25),
            'notes' => 'Factura de prueba para demostración del sistema',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
