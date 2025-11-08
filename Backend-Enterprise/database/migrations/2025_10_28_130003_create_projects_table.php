<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Código único del proyecto (ej: PV-2025-001)
            $table->string('name'); // Nombre del proyecto
            $table->text('description')->nullable(); // Descripción del proyecto
            $table->unsignedBigInteger('client_id'); // Cliente asociado
            $table->string('account_number')->nullable(); // Número de cuenta Air-e
            $table->string('project_type')->default('AGPE'); // Tipo de proyecto (AGPE, GD, etc.)
            $table->string('department'); // Departamento del proyecto
            $table->string('municipality'); // Municipio del proyecto
            $table->text('address'); // Dirección del proyecto
            $table->string('coordinates')->nullable(); // Coordenadas GPS
            $table->decimal('capacity_dc', 10, 2); // Capacidad DC en kW
            $table->decimal('capacity_ac', 10, 2); // Capacidad AC en kW
            $table->decimal('nominal_power', 10, 2)->nullable(); // Potencia nominal
            $table->integer('number_panels'); // Número de paneles
            $table->integer('number_inverters'); // Número de inversores
            $table->string('inverter_manufacturer')->nullable(); // Fabricante de inversores
            $table->string('inverter_model')->nullable(); // Modelo de inversores
            $table->string('voltage_level')->nullable(); // Nivel de tensión
            $table->string('transformer_number')->nullable(); // Número de transformador
            $table->string('connection_point')->nullable(); // Punto de conexión
            $table->boolean('excess_delivery')->default(false); // Entrega de excedentes
            $table->decimal('contract_value', 15, 2); // Valor del contrato
            $table->date('contract_date')->nullable(); // Fecha del contrato
            $table->string('responsible_commercial')->nullable(); // Responsable comercial
            $table->string('sales_channel')->default('Direct'); // Canal de venta
            $table->decimal('average_ticket', 15, 2)->nullable(); // Ticket promedio
            $table->decimal('projected_revenue', 15, 2)->nullable(); // Ingresos proyectados
            $table->decimal('estimated_margin', 5, 2)->nullable(); // Margen estimado
            $table->date('start_date'); // Fecha de inicio
            $table->date('application_date')->nullable(); // Fecha de solicitud presentada
            $table->date('completeness_start_date')->nullable(); // Fecha de inicio de revisión de completitud
            $table->date('completeness_end_date')->nullable(); // Fecha de finalización de revisión de completitud
            $table->date('technical_review_start_date')->nullable(); // Fecha de inicio de revisión técnica
            $table->date('technical_review_end_date')->nullable(); // Fecha de finalización de revisión técnica
            $table->date('feasibility_concept_date')->nullable(); // Fecha de concepto de viabilidad
            $table->date('installation_start_date')->nullable(); // Fecha de inicio de instalación
            $table->date('installation_end_date')->nullable(); // Fecha de finalización de instalación
            $table->date('inspection_requested_date')->nullable(); // Fecha de solicitud de inspección
            $table->date('inspection_performed_date')->nullable(); // Fecha de inspección realizada
            $table->date('final_approval_date')->nullable(); // Fecha de aprobación final
            $table->date('connection_date')->nullable(); // Fecha de conexión
            $table->date('estimated_completion_date'); // Fecha estimada de finalización
            $table->unsignedBigInteger('current_state_id'); // Estado actual del proyecto
            $table->integer('progress_percentage')->default(0); // Porcentaje de avance
            $table->text('aire_observations')->nullable(); // Observaciones de Air-e
            $table->text('corrective_actions')->nullable(); // Acciones correctivas
            $table->text('internal_comments')->nullable(); // Comentarios internos
            $table->string('current_responsible')->nullable(); // Responsable actual
            $table->text('next_action')->nullable(); // Próxima acción
            $table->date('next_action_date')->nullable(); // Fecha de próxima acción
            $table->json('additional_data')->nullable(); // Datos adicionales en formato JSON
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable(); // Usuario que creó el proyecto
            $table->unsignedBigInteger('updated_by')->nullable(); // Usuario que actualizó el proyecto
            $table->timestamps();
            $table->softDeletes();
        });
        
        // Definir llaves foráneas después de crear la tabla para evitar problemas
        Schema::table('projects', function (Blueprint $table) {
            $table->foreign('client_id')->references('client_id')->on('clients')->onDelete('cascade');
            $table->foreign('current_state_id')->references('id')->on('project_states')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};