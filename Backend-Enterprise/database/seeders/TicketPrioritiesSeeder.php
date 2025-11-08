<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketPrioritiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar datos
        DB::table('ticket_priorities')->truncate();
        
        // Insertar prioridades de tickets
        DB::table('ticket_priorities')->insert([
            [
                'name' => 'Baja',
                'description' => 'Problemas menores que no afectan el funcionamiento inmediato',
                'color' => '#06b6d4', // azul claro
                'sla_hours' => 168, // 1 semana
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Media',
                'description' => 'Problemas que afectan parcialmente el funcionamiento',
                'color' => '#f59e0b', // amarillo
                'sla_hours' => 72, // 3 días
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Alta',
                'description' => 'Problemas que afectan significativamente el funcionamiento',
                'color' => '#ef4444', // rojo
                'sla_hours' => 24, // 1 día
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Crítica',
                'description' => 'Problemas que detienen completamente el funcionamiento',
                'color' => '#dc2626', // rojo oscuro
                'sla_hours' => 4, // 4 horas
                'order' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}