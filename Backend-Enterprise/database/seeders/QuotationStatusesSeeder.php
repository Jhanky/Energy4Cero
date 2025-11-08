<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuotationStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // No necesitamos hacer nada aquí ya que los datos se insertan en la migración
        // 2025_10_22_180000_insert_quotation_statuses_data.php
        $this->command->info('QuotationStatusesSeeder completado (datos ya insertados por migración).');
    }
}