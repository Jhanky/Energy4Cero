<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Client;
use App\Models\Quotation;
use App\Models\Panel;
use App\Models\Inverter;
use App\Models\Battery;

class QuotationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear cotizaciones de ejemplo
        $clients = Client::all();
        $users = User::all();
        $panels = Panel::all();
        $inverters = Inverter::all();
        $batteries = Battery::all();

        if ($clients->isEmpty() || $users->isEmpty()) {
            $this->command->info('No hay clientes o usuarios disponibles para crear cotizaciones de ejemplo.');
            return;
        }

        // Ejemplo de cotizaciones
        $quotations = [
            [
                'client_id' => $clients->first()->client_id,
                'user_id' => $users->first()->id,
                'project_name' => 'Instalación Solar Residencial',
                'system_type' => 'On-grid',
                'power_kwp' => 5.00,
                'panel_count' => 16,
                'requires_financing' => false,
                'profit_percentage' => 0.050,
                'iva_profit_percentage' => 0.190,
                'commercial_management_percentage' => 0.030,
                'administration_percentage' => 0.080,
                'contingency_percentage' => 0.020,
                'withholding_percentage' => 0.035,
                'status_id' => 1, // Borrador
            ],
            [
                'client_id' => $clients->skip(1)->first()?->client_id ?? $clients->first()->client_id,
                'user_id' => $users->skip(1)->first()?->id ?? $users->first()->id,
                'project_name' => 'Proyecto Energía Comercial',
                'system_type' => 'Híbrido',
                'power_kwp' => 15.00,
                'panel_count' => 48,
                'requires_financing' => true,
                'profit_percentage' => 0.060,
                'iva_profit_percentage' => 0.190,
                'commercial_management_percentage' => 0.035,
                'administration_percentage' => 0.085,
                'contingency_percentage' => 0.025,
                'withholding_percentage' => 0.040,
                'status_id' => 2, // Enviada
            ],
            [
                'client_id' => $clients->skip(2)->first()?->client_id ?? $clients->first()->client_id,
                'user_id' => $users->skip(2)->first()?->id ?? $users->first()->id,
                'project_name' => 'Sistema Solar Industrial',
                'system_type' => 'Off-grid',
                'power_kwp' => 50.00,
                'panel_count' => 160,
                'requires_financing' => true,
                'profit_percentage' => 0.070,
                'iva_profit_percentage' => 0.190,
                'commercial_management_percentage' => 0.040,
                'administration_percentage' => 0.090,
                'contingency_percentage' => 0.030,
                'withholding_percentage' => 0.045,
                'status_id' => 4, // Aceptada
            ]
        ];

        foreach ($quotations as $quotationData) {
            $quotation = Quotation::create($quotationData);

            // Crear productos utilizados para la cotización si hay productos disponibles
            if (!$panels->isEmpty()) {
                $panel = $panels->random();
                \App\Models\UsedProduct::create([
                    'quotation_id' => $quotation->quotation_id,
                    'product_type' => 'panel',
                    'product_id' => $panel->panel_id,
                    'quantity' => $quotation->panel_count,
                    'unit_price' => $panel->price,
                    'profit_percentage' => 0.05,
                    'partial_value' => $panel->price * $quotation->panel_count,
                    'profit' => ($panel->price * $quotation->panel_count) * 0.05,
                    'total_value' => ($panel->price * $quotation->panel_count) * 1.05,
                ]);
            }

            if (!$inverters->isEmpty()) {
                $inverter = $inverters->random();
                \App\Models\UsedProduct::create([
                    'quotation_id' => $quotation->quotation_id,
                    'product_type' => 'inverter',
                    'product_id' => $inverter->inverter_id,
                    'quantity' => 1,
                    'unit_price' => $inverter->price,
                    'profit_percentage' => 0.06,
                    'partial_value' => $inverter->price,
                    'profit' => $inverter->price * 0.06,
                    'total_value' => $inverter->price * 1.06,
                ]);
            }

            if (!$batteries->isEmpty() && in_array($quotation->system_type, ['Híbrido', 'Off-grid'])) {
                $battery = $batteries->random();
                \App\Models\UsedProduct::create([
                    'quotation_id' => $quotation->quotation_id,
                    'product_type' => 'battery',
                    'product_id' => $battery->battery_id,
                    'quantity' => 4,
                    'unit_price' => $battery->price,
                    'profit_percentage' => 0.07,
                    'partial_value' => $battery->price * 4,
                    'profit' => ($battery->price * 4) * 0.07,
                    'total_value' => ($battery->price * 4) * 1.07,
                ]);
            }
        }

        $this->command->info('Cotizaciones de ejemplo creadas exitosamente.');
    }
}