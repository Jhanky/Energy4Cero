<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\City;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        City::truncate(); // Elimina todos los registros existentes

        $cities = [
            ['name' => 'Leticia', 'department_id' => 1],
            ['name' => 'Medellín', 'department_id' => 2],
            ['name' => 'Arauca', 'department_id' => 3],
            ['name' => 'Barranquilla', 'department_id' => 4],
            ['name' => 'Cartagena', 'department_id' => 5],
            ['name' => 'Tunja', 'department_id' => 6],
            ['name' => 'Manizales', 'department_id' => 7],
            ['name' => 'Florencia', 'department_id' => 8],
            ['name' => 'Yopal', 'department_id' => 9],
            ['name' => 'Popayán', 'department_id' => 10],
            ['name' => 'Valledupar', 'department_id' => 11],
            ['name' => 'Quibdó', 'department_id' => 12],
            ['name' => 'Montería', 'department_id' => 13],
            ['name' => 'Bogotá', 'department_id' => 14],
            ['name' => 'Inírida', 'department_id' => 15],
            ['name' => 'San José del Guaviare', 'department_id' => 16],
            ['name' => 'Neiva', 'department_id' => 17],
            ['name' => 'Riohacha', 'department_id' => 18],
            ['name' => 'Santa Marta', 'department_id' => 19],
            ['name' => 'Villavicencio', 'department_id' => 20],
            ['name' => 'Pasto', 'department_id' => 21],
            ['name' => 'Cúcuta', 'department_id' => 22],
            ['name' => 'Mocoa', 'department_id' => 23],
            ['name' => 'Armenia', 'department_id' => 24],
            ['name' => 'Pereira', 'department_id' => 25],
            ['name' => 'San Andrés', 'department_id' => 26],
            ['name' => 'Bucaramanga', 'department_id' => 27],
            ['name' => 'Sincelejo', 'department_id' => 28],
            ['name' => 'Ibagué', 'department_id' => 29],
            ['name' => 'Cali', 'department_id' => 30],
            ['name' => 'Mitú', 'department_id' => 31],
            ['name' => 'Puerto Carreño', 'department_id' => 32],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}
