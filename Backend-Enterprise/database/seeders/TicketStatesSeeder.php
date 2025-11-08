<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketStatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar datos
        DB::table('ticket_states')->truncate();
        
        // Insertar estados de tickets
        DB::table('ticket_states')->insert([
            [
                'name' => 'Abierto',
                'description' => 'Ticket recién creado y pendiente de revisión',
                'color' => '#ef4444', // rojo
                'active' => true,
                'is_final' => false,
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'En Proceso',
                'description' => 'Ticket en proceso de resolución',
                'color' => '#f59e0b', // amarillo
                'active' => true,
                'is_final' => false,
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Esperando Cliente',
                'description' => 'Se espera información o acción del cliente',
                'color' => '#8b5cf6', // morado
                'active' => true,
                'is_final' => false,
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Esperando Repuestos',
                'description' => 'Se espera la llegada de repuestos para solución',
                'color' => '#f59e0b', // amarillo
                'active' => true,
                'is_final' => false,
                'order' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Resuelto',
                'description' => 'Ticket resuelto, pendiente de confirmación del cliente',
                'color' => '#22c55e', // verde
                'active' => false,
                'is_final' => false,
                'order' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Cerrado',
                'description' => 'Ticket cerrado y confirmado por cliente',
                'color' => '#64748b', // gris
                'active' => false,
                'is_final' => true,
                'order' => 6,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Cancelado',
                'description' => 'Ticket cancelado por el cliente',
                'color' => '#94a3b8', // gris claro
                'active' => false,
                'is_final' => true,
                'order' => 7,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}