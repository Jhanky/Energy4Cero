<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar datos (pero solo si la tabla existe)
        if (DB::getSchemaBuilder()->hasTable('tickets')) {
            DB::table('tickets')->truncate();
        }
        
        // Solo insertar si existen los datos necesarios
        $existingProjects = DB::table('projects')->count();
        $existingClients = DB::table('clients')->count();
        $existingUsers = DB::table('users')->count();
        $existingTicketTypes = DB::table('ticket_types')->count();
        $existingTicketPriorities = DB::table('ticket_priorities')->count();
        $existingTicketStates = DB::table('ticket_states')->count();
        
        if ($existingProjects > 0 && $existingClients > 0 && $existingUsers > 0 && 
            $existingTicketTypes > 0 && $existingTicketPriorities > 0 && $existingTicketStates > 0) {
            
            // Obtener IDs de registros existentes
            $projects = DB::table('projects')->pluck('id')->toArray();
            $clients = DB::table('clients')->pluck('id')->toArray();
            $users = DB::table('users')->pluck('id')->toArray();
            $ticketTypes = DB::table('ticket_types')->pluck('id')->toArray();
            $ticketPriorities = DB::table('ticket_priorities')->pluck('id')->toArray();
            $ticketStates = DB::table('ticket_states')->pluck('id')->toArray();
            
            // Insertar tickets de ejemplo
            $tickets = [];
            
            // Crear hasta 5 tickets de ejemplo solo si hay datos suficientes
            for ($i = 0; $i < min(5, count($projects), count($clients), count($users)); $i++) {
                $tickets[] = [
                    'ticket_code' => 'TK-' . date('Y') . '-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                    'project_id' => $projects[array_rand($projects)],
                    'client_id' => $clients[array_rand($clients)],
                    'title' => 'Ticket de Ejemplo #' . ($i + 1),
                    'description' => 'Descripción del ticket de ejemplo #' . ($i + 1) . '. Este ticket es parte de los datos de ejemplo para demostrar el sistema de tickets.',
                    'type_id' => $ticketTypes[array_rand($ticketTypes)],
                    'priority_id' => $ticketPriorities[array_rand($ticketPriorities)],
                    'status_id' => $ticketStates[array_rand($ticketStates)],
                    'technicians_assigned' => json_encode(['Técnico ' . ($i + 1)]),
                    'created_by' => $users[array_rand($users)],
                    'due_date' => now()->addDays(rand(1, 30)),
                    'resolution_date' => null,
                    'sla_hours' => rand(4, 168),
                    'metadata' => json_encode(['ubicacion' => 'Ciudad ' . ($i + 1)]),
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            
            if (!empty($tickets)) {
                DB::table('tickets')->insert($tickets);
            }
        }
    }
}