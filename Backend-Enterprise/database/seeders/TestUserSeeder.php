<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario de prueba
        User::create([
            'name' => 'Admin Test',
            'email' => 'admin@energy4cero.com',
            'password' => Hash::make('Jh@nky007'),
            'phone' => '1234567890',
            'department' => 'IT',
            'position' => 'Administrator',
            'role_id' => 1, // Asumiendo que el rol con ID 1 existe
            'is_active' => true,
        ]);
    }
}