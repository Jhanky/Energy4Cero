<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Maintenance;

class MaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Maintenance::create([
            'title' => 'Mantenimiento Preventivo - Paneles Solares',
            'description' => 'Revisión completa de paneles solares y sistema fotovoltaico',
            'type' => 'preventive',
            'priority' => 'medium',
            'status' => 'scheduled',
            'scheduled_date' => '2025-11-15',
            'project_id' => 1,
            'created_by_user_id' => 1,
            'notes' => 'Verificar estado de paneles, conexiones y rendimiento del sistema',
        ]);

        Maintenance::create([
            'title' => 'Mantenimiento Correctivo - Inversor',
            'description' => 'Reparación de inversor con problemas de funcionamiento',
            'type' => 'corrective',
            'priority' => 'high',
            'status' => 'scheduled',
            'scheduled_date' => '2025-11-20',
            'project_id' => 2,
            'created_by_user_id' => 1,
            'notes' => 'Inversor presenta fallos intermitentes, requiere revisión técnica',
        ]);

        Maintenance::create([
            'title' => 'Inspección Predictiva - Baterías',
            'description' => 'Análisis predictivo del estado de las baterías',
            'type' => 'predictive',
            'priority' => 'low',
            'status' => 'scheduled',
            'scheduled_date' => '2025-11-25',
            'project_id' => 3,
            'created_by_user_id' => 1,
            'notes' => 'Monitoreo del estado de carga y capacidad de las baterías',
        ]);
    }
}
