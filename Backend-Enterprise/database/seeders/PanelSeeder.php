<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Panel;

class PanelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Paneles existentes
        Panel::create([
            'model' => 'JKM415M-54HL4-B',
            'brand' => 'Jinko Solar',
            'power_output' => 415,
            'price' => 850000,
            'technical_sheet_path' => 'panels/jinko-415.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'CS3K-395MS',
            'brand' => 'Canadian Solar',
            'power_output' => 395,
            'price' => 780000,
            'technical_sheet_path' => 'panels/canadian-395.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'TSM-400DE15M(II)',
            'brand' => 'Trina Solar',
            'power_output' => 400,
            'price' => 820000,
            'technical_sheet_path' => 'panels/trina-400.pdf',
            'is_active' => true,
        ]);

        // Nuevos paneles
        Panel::create([
            'model' => 'HiKu7 Mono PERC 540W',
            'brand' => 'HiKu Solar',
            'power_output' => 540,
            'price' => 950000,
            'technical_sheet_path' => 'panels/hiku-540.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'HMS600-12-48 HJT 600W',
            'brand' => 'HMS Solar',
            'power_output' => 600,
            'price' => 1200000,
            'technical_sheet_path' => 'panels/hms-600.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'PANASONIC N340RB',
            'brand' => 'Panasonic',
            'power_output' => 340,
            'price' => 1100000,
            'technical_sheet_path' => 'panels/panasonic-340.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'SPR-X22-370-WHT',
            'brand' => 'SunPower',
            'power_output' => 370,
            'price' => 1300000,
            'technical_sheet_path' => 'panels/sunpower-370.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'LR4-72HBD-450M',
            'brand' => 'Longi Solar',
            'power_output' => 450,
            'price' => 900000,
            'technical_sheet_path' => 'panels/longi-450.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'VMR-460-40HC',
            'brand' => 'Vikram Solar',
            'power_output' => 460,
            'price' => 880000,
            'technical_sheet_path' => 'panels/vikram-460.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'PVM 410 BKHSF',
            'brand' => 'Phono Solar',
            'power_output' => 410,
            'price' => 790000,
            'technical_sheet_path' => 'panels/phono-410.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'TAM-455-72H-30A',
            'brand' => 'Tamesol',
            'power_output' => 455,
            'price' => 830000,
            'technical_sheet_path' => 'panels/tamesol-455.pdf',
            'is_active' => true,
        ]);

        Panel::create([
            'model' => 'PS380P05-AG',
            'brand' => 'Peimar',
            'power_output' => 380,
            'price' => 760000,
            'technical_sheet_path' => 'panels/peimar-380.pdf',
            'is_active' => true,
        ]);
    }
}
