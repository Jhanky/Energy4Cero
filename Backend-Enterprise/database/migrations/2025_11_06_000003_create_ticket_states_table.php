<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ticket_states', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del estado (Abierto, En Proceso, etc.)
            $table->string('description')->nullable(); // Descripción del estado
            $table->string('color'); // Color para mostrar en interfaz
            $table->boolean('active')->default(true); // Si el estado está activo
            $table->boolean('is_final')->default(false); // Si es un estado final (cerrado, resuelto)
            $table->integer('order')->default(0); // Orden para mostrar
            $table->timestamps();
            $table->softDeletes(); // Soft deletes para mantener histórico
        });
        
        // Insertar estados por defecto
        \DB::table('ticket_states')->insert([
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ticket_states');
    }
};