<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ToolState;

class ToolStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $toolStates = [
            [
                'name' => 'Disponible',
                'color' => '#10b981', // Verde
                'description' => 'Herramienta disponible para uso',
                'is_active' => true
            ],
            [
                'name' => 'En Uso',
                'color' => '#3b82f6', // Azul
                'description' => 'Herramienta actualmente en uso en un proyecto',
                'is_active' => true
            ],
            [
                'name' => 'En Mantenimiento',
                'color' => '#f59e0b', // Amarillo
                'description' => 'Herramienta en proceso de mantenimiento o reparación',
                'is_active' => true
            ],
            [
                'name' => 'Dañada',
                'color' => '#ef4444', // Rojo
                'description' => 'Herramienta dañada y requiere reparación',
                'is_active' => true
            ],
            [
                'name' => 'En Calibración',
                'color' => '#8b5cf6', // Violeta
                'description' => 'Herramienta en proceso de calibración',
                'is_active' => true
            ],
            [
                'name' => 'Obsoleta',
                'color' => '#6b7280', // Gris
                'description' => 'Herramienta obsoleta o fuera de servicio',
                'is_active' => true
            ],
            [
                'name' => 'Prestada',
                'color' => '#06b6d4', // Cyan
                'description' => 'Herramienta prestada temporalmente',
                'is_active' => true
            ]
        ];

        foreach ($toolStates as $state) {
            ToolState::create($state);
        }
    }
}
