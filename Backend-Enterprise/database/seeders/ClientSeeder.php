<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
use App\Models\User;
use Faker\Factory as Faker;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Client::truncate(); // Elimina todos los registros existentes

        $faker = Faker::create('es_CO');

        // Obtener un usuario existente para asignar como responsable
        $responsibleUser = User::first();
        if (!$responsibleUser) {
            // Si no hay usuarios, creamos uno básico para asignar
            $responsibleUser = User::create([
                'name' => 'Usuario Responsable',
                'email' => 'responsable@empresa.com',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]);
        }

        // Crear 50 clientes de prueba
        $departmentsWithCities = \App\Models\Department::has('cities')->get();

        if ($departmentsWithCities->isEmpty()) {
            $this->command->info('No departments with cities found. Skipping client seeding.');
            return;
        }

        for ($i = 0; $i < 50; $i++) {
            $randomDepartment = $departmentsWithCities->random();
            $citiesInDepartment = $randomDepartment->cities;

            $cityId = null;
            if ($citiesInDepartment->isNotEmpty()) {
                $cityId = $citiesInDepartment->random()->id;
            }

            Client::create([
                'name' => $faker->name,
                'client_type' => $faker->randomElement(['residencial', 'comercial', 'industrial']),
                'email' => $faker->unique()->safeEmail,
                'phone' => $faker->phoneNumber,
                'nic' => $faker->unique()->randomNumber(5, true), // NIC de 5 dígitos
                'responsible_user_id' => $responsibleUser->id,
                'department_id' => $randomDepartment->id,
                'city_id' => $cityId,
                'address' => $faker->address,
                'monthly_consumption' => $faker->randomFloat(2, 50, 2000),
                'notes' => $faker->sentence,
                'is_active' => $faker->boolean(90),
            ]);
        }
    }
}