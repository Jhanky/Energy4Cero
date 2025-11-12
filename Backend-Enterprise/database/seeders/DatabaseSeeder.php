<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Deshabilitar la verificación de claves foráneas
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

        $this->call([
            DepartmentSeeder::class,
            CitySeeder::class,
            RoleTruncateSeeder::class,
            RoleSeeder::class,
            UserTruncateSeeder::class,
            UserSeeder::class,
            ClientSeeder::class,
            PanelTruncateSeeder::class,
            PanelSeeder::class,
            InverterTruncateSeeder::class,
            InverterSeeder::class,
            BatteryTruncateSeeder::class,
            BatterySeeder::class,
            QuotationStatusesSeeder::class,
            QuotationsSeeder::class,
            QuotationAdditionalCostsTableSeeder::class,
            QuotationSuppliesTableSeeder::class,
            TicketTypesSeeder::class,
            TicketPrioritiesSeeder::class,
            TicketStatesSeeder::class,
            TicketsSeeder::class,
            ToolStateSeeder::class,
        ]);

        // Habilitar la verificación de claves foráneas
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }
}
