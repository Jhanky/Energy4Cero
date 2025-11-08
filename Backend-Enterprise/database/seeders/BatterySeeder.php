<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Battery;

class BatterySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Baterías existentes
        Battery::create([
            'name' => 'Batería Tesla Powerwall 2',
            'model' => 'Powerwall 2',
            'brand' => 'Tesla',
            'ah_capacity' => 13.5,
            'voltage' => 48,
            'type' => 'Litio',
            'price' => 15000000,
            'technical_sheet_path' => 'batteries/tesla-powerwall.pdf',
            'is_active' => true,
        ]);

        Battery::create([
            'name' => 'Batería LG Chem RESU10H',
            'model' => 'RESU10H',
            'brand' => 'LG Chem',
            'ah_capacity' => 9.8,
            'voltage' => 48,
            'type' => 'Litio',
            'price' => 12000000,
            'technical_sheet_path' => 'batteries/lg-resu10h.pdf',
            'is_active' => true,
        ]);

        Battery::create([
            'name' => 'Batería BYD B-Box Pro',
            'model' => 'B-Box Pro',
            'brand' => 'BYD',
            'ah_capacity' => 11.0,
            'voltage' => 48,
            'type' => 'Litio',
            'price' => 11000000,
            'technical_sheet_path' => 'batteries/byd-bbox.pdf',
            'is_active' => true,
        ]);

        // Nuevas baterías de gel
        Battery::create([
            'name' => 'Batería Rolls Surrette S-4000',
            'model' => 'S-4000',
            'brand' => 'Rolls Surrette',
            'ah_capacity' => 400,
            'voltage' => 12,
            'type' => 'Gel',
            'price' => 3500000,
            'technical_sheet_path' => 'batteries/rolls-s4000.pdf',
            'is_active' => true,
        ]);

        Battery::create([
            'name' => 'Batería Trojan T-105',
            'model' => 'T-105',
            'brand' => 'Trojan',
            'ah_capacity' => 225,
            'voltage' => 6,
            'type' => 'Gel',
            'price' => 1800000,
            'technical_sheet_path' => 'batteries/trojan-t105.pdf',
            'is_active' => true,
        ]);

        // Nuevas baterías de litio
        Battery::create([
            'name' => 'Batería Pylontech US3000',
            'model' => 'US3000',
            'brand' => 'Pylontech',
            'ah_capacity' => 15,
            'voltage' => 48,
            'type' => 'Litio',
            'price' => 9500000,
            'technical_sheet_path' => 'batteries/pylontech-us3000.pdf',
            'is_active' => true,
        ]);

        Battery::create([
            'name' => 'Batería Winston LiFePO4 100Ah',
            'model' => 'Winston LiFePO4',
            'brand' => 'Winston Battery',
            'ah_capacity' => 100,
            'voltage' => 3.2,
            'type' => 'Litio',
            'price' => 2500000,
            'technical_sheet_path' => 'batteries/winston-lifepo4.pdf',
            'is_active' => true,
        ]);
    }
}
