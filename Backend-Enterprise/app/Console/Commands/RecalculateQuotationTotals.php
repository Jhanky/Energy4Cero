<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Quotation;

class RecalculateQuotationTotals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'quotations:recalculate-totals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula los totales de todas las cotizaciones existentes';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Recalculando totales de cotizaciones...');

        // Obtener todas las cotizaciones
        $quotations = Quotation::all();
        
        $this->info('Encontradas ' . $quotations->count() . ' cotizaciones para recalcular.');

        $bar = $this->output->createProgressBar($quotations->count());
        $bar->start();

        $recalculated = 0;
        $errors = 0;

        foreach ($quotations as $quotation) {
            try {
                // Cargar las relaciones necesarias para el cálculo
                $quotation->load(['usedProducts', 'items']);
                
                // Calcular todos los totales
                $quotation->calculateTotals();
                
                $recalculated++;
            } catch (\Exception $e) {
                $this->error('Error al recalcular cotización ID ' . $quotation->quotation_id . ': ' . $e->getMessage());
                $errors++;
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->info('');

        $this->info('✅ Totales recalculados para ' . $recalculated . ' cotizaciones.');
        
        if ($errors > 0) {
            $this->warn('⚠️  Hubo ' . $errors . ' errores al recalcular cotizaciones.');
        }

        return 0;
    }
}
