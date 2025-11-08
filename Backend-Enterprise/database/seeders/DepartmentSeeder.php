<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::truncate(); // Elimina todos los registros existentes

        $departments = [
            ['name' => 'Amazonas'],
            ['name' => 'Antioquia'],
            ['name' => 'Arauca'],
            ['name' => 'Atlántico'],
            ['name' => 'Bolívar'],
            ['name' => 'Boyacá'],
            ['name' => 'Caldas'],
            ['name' => 'Caquetá'],
            ['name' => 'Casanare'],
            ['name' => 'Cauca'],
            ['name' => 'Cesar'],
            ['name' => 'Chocó'],
            ['name' => 'Córdoba'],
            ['name' => 'Cundinamarca'],
            ['name' => 'Guainía'],
            ['name' => 'Guaviare'],
            ['name' => 'Huila'],
            ['name' => 'La Guajira'],
            ['name' => 'Magdalena'],
            ['name' => 'Meta'],
            ['name' => 'Nariño'],
            ['name' => 'Norte de Santander'],
            ['name' => 'Putumayo'],
            ['name' => 'Quindío'],
            ['name' => 'Risaralda'],
            ['name' => 'San Andrés y Providencia'],
            ['name' => 'Santander'],
            ['name' => 'Sucre'],
            ['name' => 'Tolima'],
            ['name' => 'Valle del Cauca'],
            ['name' => 'Vaupés'],
            ['name' => 'Vichada'],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
