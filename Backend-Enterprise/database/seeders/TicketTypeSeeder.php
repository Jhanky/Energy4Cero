<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Insertar tipos de tickets por defecto
        $ticketTypes = [
            [
                'name' => 'Mantenimiento Preventivo',
                'description' => 'Mantenimiento programado para prevenir fallas',
                'color' => '#3b82f6',
                'priority_level' => 'media',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Mantenimiento Correctivo',
                'description' => 'Mantenimiento realizado para corregir fallas existentes',
                'color' => '#f59e0b',
                'priority_level' => 'alta',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Falla de Inversor',
                'description' => 'Problemas con equipos inversores',
                'color' => '#ef4444',
                'priority_level' => 'alta',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Falla de Paneles',
                'description' => 'Problemas con paneles solares',
                'color' => '#ef4444',
                'priority_level' => 'alta',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Problema de Conexión',
                'description' => 'Problemas de conexión con Air-e u otras redes',
                'color' => '#dc2626',
                'priority_level' => 'critica',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Bajo Rendimiento',
                'description' => 'Sistema con rendimiento inferior al esperado',
                'color' => '#f59e0b',
                'priority_level' => 'media',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Consulta Técnica',
                'description' => 'Consultas técnicas sobre sistemas instalados',
                'color' => '#06b6d4',
                'priority_level' => 'baja',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Solicitud de Inspección',
                'description' => 'Solicitudes de inspección técnica',
                'color' => '#8b5cf6',
                'priority_level' => 'media',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Actualización de Sistema',
                'description' => 'Actualizaciones de firmware o software',
                'color' => '#10b981',
                'priority_level' => 'baja',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Capacitación',
                'description' => 'Capacitación sobre manejo del sistema',
                'color' => '#06b6d4',
                'priority_level' => 'baja',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('ticket_types')->insert($ticketTypes);
    }
}