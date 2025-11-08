<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener roles
        $adminRole = Role::where('slug', 'administrador')->first();
        $gerenteRole = Role::where('slug', 'gerente')->first();
        $comercialRole = Role::where('slug', 'comercial')->first();
        $contadorRole = Role::where('slug', 'contador')->first();
        $ingenieroRole = Role::where('slug', 'ingeniero')->first();
        $tecnicoRole = Role::where('slug', 'tecnico')->first();

        $users = [
            // Usuario administrador
            [
                'name' => 'Administrador del Sistema',
                'email' => 'admin@energy4cero.com',
                'password' => Hash::make('admin123'),
                'phone' => '+57 300 000 0000',
                'department' => 'Sistema',
                'position' => 'Administrador',
                'role_id' => $adminRole->role_id,
                'is_active' => true,
            ],
            [
                'name' => 'Gerente General',
                'email' => 'gerente@energy4cero.com',
                'password' => Hash::make('password123'),
                'phone' => '+57 300 111 1111',
                'department' => 'Gerencia',
                'position' => 'Gerente',
                'role_id' => $gerenteRole->role_id,
                'is_active' => true,
            ],
            [
                'name' => 'Especialista Comercial',
                'email' => 'comercial@energy4cero.com',
                'password' => Hash::make('password123'),
                'phone' => '+57 300 222 2222',
                'department' => 'Comercial',
                'position' => 'Comercial',
                'role_id' => $comercialRole->role_id,
                'is_active' => true,
            ],
            [
                'name' => 'Contador General',
                'email' => 'contador@energy4cero.com',
                'password' => Hash::make('password123'),
                'phone' => '+57 300 333 3333',
                'department' => 'Contabilidad',
                'position' => 'Contador',
                'role_id' => $contadorRole->role_id,
                'is_active' => true,
            ],
            [
                'name' => 'Ingeniero de Proyectos',
                'email' => 'ingeniero@energy4cero.com',
                'password' => Hash::make('password123'),
                'phone' => '+57 300 444 4444',
                'department' => 'Ingeniería',
                'position' => 'Ingeniero',
                'role_id' => $ingenieroRole->role_id,
                'is_active' => true,
            ],
            [
                'name' => 'Técnico Especialista',
                'email' => 'tecnico@energy4cero.com',
                'password' => Hash::make('password123'),
                'phone' => '+57 300 555 5555',
                'department' => 'Técnico',
                'position' => 'Técnico',
                'role_id' => $tecnicoRole->role_id,
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}