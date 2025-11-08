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
        Schema::create('ticket_priorities', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre de la prioridad (Baja, Media, etc.)
            $table->string('description')->nullable(); // Descripción de la prioridad
            $table->string('color'); // Color para mostrar en interfaz
            $table->integer('sla_hours'); // Horas de SLA para resolver
            $table->integer('order')->default(1); // Orden de prioridad (1 = menor, más alto = mayor prioridad)
            $table->timestamps();
            $table->softDeletes(); // Soft deletes para mantener histórico
        });
        
        // Insertar prioridades por defecto
        \DB::table('ticket_priorities')->insert([
            [
                'name' => 'Baja',
                'description' => 'Problemas menores que no afectan el funcionamiento inmediato',
                'color' => '#06b6d4', // azul claro
                'sla_hours' => 168, // 1 semana
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Media',
                'description' => 'Problemas que afectan parcialmente el funcionamiento',
                'color' => '#f59e0b', // amarillo
                'sla_hours' => 72, // 3 días
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Alta',
                'description' => 'Problemas que afectan significativamente el funcionamiento',
                'color' => '#ef4444', // rojo
                'sla_hours' => 24, // 1 día
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Crítica',
                'description' => 'Problemas que detienen completamente el funcionamiento',
                'color' => '#dc2626', // rojo oscuro
                'sla_hours' => 4, // 4 horas
                'order' => 4,
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
        Schema::dropIfExists('ticket_priorities');
    }
};