<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Inverter;

class InverterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inversores existentes
        Inverter::create([
            'name' => 'Inversor SMA Sunny Tripower 10000TL',
            'model' => 'Sunny Tripower 10000TL',
            'brand' => 'SMA',
            'power_output_kw' => 10,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'on-grid',
            'price' => 4500000,
            'technical_sheet_path' => 'inverters/sma-10000.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Fronius Primo 8.2-1',
            'model' => 'Primo 8.2-1',
            'brand' => 'Fronius',
            'power_output_kw' => 8.2,
            'grid_type' => 'monofasico',
            'system_type' => 'on-grid',
            'price' => 3800000,
            'technical_sheet_path' => 'inverters/fronius-8200.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Huawei SUN2000-10KTL-M1',
            'model' => 'SUN2000-10KTL-M1',
            'brand' => 'Huawei',
            'power_output_kw' => 10,
            'grid_type' => 'trifasico 440v',
            'system_type' => 'hibrido',
            'price' => 4200000,
            'technical_sheet_path' => 'inverters/huawei-10000.pdf',
            'is_active' => true,
        ]);

        // Nuevos inversores de sistema
        Inverter::create([
            'name' => 'Inversor Growatt SPH 6000',
            'model' => 'SPH 6000',
            'brand' => 'Growatt',
            'power_output_kw' => 6,
            'grid_type' => 'monofasico',
            'system_type' => 'off-grid',
            'price' => 3200000,
            'technical_sheet_path' => 'inverters/growatt-sph6000.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Victron MultiPlus-II 48/5000',
            'model' => 'MultiPlus-II 48/5000',
            'brand' => 'Victron Energy',
            'power_output_kw' => 5,
            'grid_type' => 'monofasico',
            'system_type' => 'off-grid',
            'price' => 4800000,
            'technical_sheet_path' => 'inverters/victron-5000.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Schneider XW Pro 8548',
            'model' => 'XW Pro 8548',
            'brand' => 'Schneider Electric',
            'power_output_kw' => 8.5,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'off-grid',
            'price' => 6500000,
            'technical_sheet_path' => 'inverters/schneider-8548.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor GoodWe ES 5048',
            'model' => 'ES 5048',
            'brand' => 'GoodWe',
            'power_output_kw' => 5,
            'grid_type' => 'monofasico',
            'system_type' => 'off-grid',
            'price' => 2900000,
            'technical_sheet_path' => 'inverters/goodwe-es5048.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Axpert VM III 5K',
            'model' => 'VM III 5K',
            'brand' => 'Axpert',
            'power_output_kw' => 5,
            'grid_type' => 'monofasico',
            'system_type' => 'off-grid',
            'price' => 2500000,
            'technical_sheet_path' => 'inverters/axpert-5k.pdf',
            'is_active' => true,
        ]);

        // Nuevos inversores de red
        Inverter::create([
            'name' => 'Inversor SolarEdge SE10K-RWS',
            'model' => 'SE10K-RWS',
            'brand' => 'SolarEdge',
            'power_output_kw' => 10,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'on-grid',
            'price' => 4700000,
            'technical_sheet_path' => 'inverters/solaredge-10k.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor ABB PVS-100/125-TL',
            'model' => 'PVS-100/125-TL',
            'brand' => 'ABB',
            'power_output_kw' => 100,
            'grid_type' => 'trifasico 440v',
            'system_type' => 'on-grid',
            'price' => 35000000,
            'technical_sheet_path' => 'inverters/abb-pvs100.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor PowerOne PVI-8.0-TL-OUTD',
            'model' => 'PVI-8.0-TL-OUTD',
            'brand' => 'PowerOne',
            'power_output_kw' => 8,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'on-grid',
            'price' => 3900000,
            'technical_sheet_path' => 'inverters/powerone-8.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Kostal Piko MP Plus 10',
            'model' => 'Piko MP Plus 10',
            'brand' => 'Kostal',
            'power_output_kw' => 10,
            'grid_type' => 'monofasico',
            'system_type' => 'on-grid',
            'price' => 4100000,
            'technical_sheet_path' => 'inverters/kostal-10.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Ginverter G5 10KTL-A',
            'model' => 'G5 10KTL-A',
            'brand' => 'Ginverter',
            'power_output_kw' => 10,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'on-grid',
            'price' => 3800000,
            'technical_sheet_path' => 'inverters/ginverter-10k.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor SofarSolar ME 3300TL',
            'model' => 'ME 3300TL',
            'brand' => 'SofarSolar',
            'power_output_kw' => 3.3,
            'grid_type' => 'monofasico',
            'system_type' => 'on-grid',
            'price' => 2200000,
            'technical_sheet_path' => 'inverters/sofarsolar-3300.pdf',
            'is_active' => true,
        ]);

        Inverter::create([
            'name' => 'Inversor Deye SUN-12K-SG04LP1',
            'model' => 'SUN-12K-SG04LP1',
            'brand' => 'Deye',
            'power_output_kw' => 12,
            'grid_type' => 'trifasico 220v',
            'system_type' => 'on-grid',
            'price' => 4300000,
            'technical_sheet_path' => 'inverters/deye-12k.pdf',
            'is_active' => true,
        ]);
    }
}
