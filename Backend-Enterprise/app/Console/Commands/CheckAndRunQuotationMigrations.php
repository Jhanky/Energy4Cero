<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckAndRunQuotationMigrations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'quotations:check-migrations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica y ejecuta las migraciones necesarias para las cotizaciones';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Verificando migraciones de cotizaciones...');

        // Verificar si la tabla quotations existe
        $quotationsExists = Schema::hasTable('quotations');
        $this->info('Tabla quotations existe: ' . ($quotationsExists ? 'Sí' : 'No'));

        // Verificar si la tabla quotation_items existe
        $quotationItemsExists = Schema::hasTable('quotation_items');
        $this->info('Tabla quotation_items existe: ' . ($quotationItemsExists ? 'Sí' : 'No'));

        // Verificar si la tabla used_products existe
        $usedProductsExists = Schema::hasTable('used_products');
        $this->info('Tabla used_products existe: ' . ($usedProductsExists ? 'Sí' : 'No'));

        // Verificar si la tabla quotation_statuses existe
        $quotationStatusesExists = Schema::hasTable('quotation_statuses');
        $this->info('Tabla quotation_statuses existe: ' . ($quotationStatusesExists ? 'Sí' : 'No'));

        if ($quotationsExists && $quotationItemsExists && $usedProductsExists && $quotationStatusesExists) {
            $this->info('✅ Todas las tablas necesarias para las cotizaciones ya existen.');
            return 0;
        }

        $this->warn('⚠️  Algunas tablas necesarias no existen. Ejecutando migraciones...');

        // Ejecutar migraciones
        $this->call('migrate', [
            '--path' => 'database/migrations',
            '--force' => true
        ]);

        // Verificar nuevamente
        $quotationsExists = Schema::hasTable('quotations');
        $quotationItemsExists = Schema::hasTable('quotation_items');
        $usedProductsExists = Schema::hasTable('used_products');
        $quotationStatusesExists = Schema::hasTable('quotation_statuses');

        if ($quotationsExists && $quotationItemsExists && $usedProductsExists && $quotationStatusesExists) {
            $this->info('✅ Todas las tablas necesarias se han creado correctamente.');
        } else {
            $this->error('❌ Hubo un problema al crear las tablas necesarias.');
            return 1;
        }

        return 0;
    }
}
