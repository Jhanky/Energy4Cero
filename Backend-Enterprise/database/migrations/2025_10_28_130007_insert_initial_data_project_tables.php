<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Insertar estados de proyecto iniciales
        DB::table('project_states')->insert([
            [
                'name' => 'Preparación de Solicitud',
                'slug' => 'preparacion-solicitud',
                'description' => 'Etapa de preparación de la solicitud de conexión',
                'color' => '#94a3b8',
                'estimated_duration' => 7,
                'order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Solicitud Presentada',
                'slug' => 'solicitud-presentada',
                'description' => 'Solicitud presentada a Air-e',
                'color' => '#60a5fa',
                'estimated_duration' => 1,
                'order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Revisión de Completitud',
                'slug' => 'revision-completitud',
                'description' => 'Revisión de la completitud de la documentación',
                'color' => '#fbbf24',
                'estimated_duration' => 10,
                'order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Revisión Técnica',
                'slug' => 'revision-tecnica',
                'description' => 'Revisión técnica por Air-e',
                'color' => '#f59e0b',
                'estimated_duration' => 15,
                'order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Concepto de Viabilidad Emitido',
                'slug' => 'concepto-viabilidad',
                'description' => 'Concepto de viabilidad emitido por Air-e',
                'color' => '#8b5cf6',
                'estimated_duration' => 2,
                'order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Instalación en Proceso',
                'slug' => 'instalacion-proceso',
                'description' => 'Instalación en proceso en sitio',
                'color' => '#3b82f6',
                'estimated_duration' => 10,
                'order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Inspección Pendiente',
                'slug' => 'inspeccion-pendiente',
                'description' => 'Inspección pendiente de realización',
                'color' => '#06b6d4',
                'estimated_duration' => 7,
                'order' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Inspección Realizada',
                'slug' => 'inspeccion-realizada',
                'description' => 'Inspección realizada por Air-e',
                'color' => '#14b8a6',
                'estimated_duration' => 1,
                'order' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Observaciones de Inspección',
                'slug' => 'observaciones-inspeccion',
                'description' => 'Observaciones de la inspección pendientes de resolver',
                'color' => '#f97316',
                'estimated_duration' => 5,
                'order' => 9,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Aprobación Final',
                'slug' => 'aprobacion-final',
                'description' => 'Aprobación final para conexión',
                'color' => '#84cc16',
                'estimated_duration' => 3,
                'order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Conectado y Operando',
                'slug' => 'conectado-operando',
                'description' => 'Sistema conectado y operando',
                'color' => '#22c55e',
                'estimated_duration' => null,
                'order' => 11,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Suspendido',
                'slug' => 'suspendido',
                'description' => 'Proyecto suspendido',
                'color' => '#ef4444',
                'estimated_duration' => null,
                'order' => 12,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Cancelado',
                'slug' => 'cancelado',
                'description' => 'Proyecto cancelado',
                'color' => '#991b1b',
                'estimated_duration' => null,
                'order' => 13,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Insertar tipos de hito iniciales
        DB::table('milestone_types')->insert([
            [
                'name' => 'Firma de Contrato',
                'slug' => 'firma-contrato',
                'description' => 'Firma del contrato con el cliente',
                'icon' => '✍️',
                'color' => '#3b82f6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Pago Recibido',
                'slug' => 'pago-recibido',
                'description' => 'Pago recibido del cliente',
                'icon' => '💵',
                'color' => '#10b981',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Documentación Enviada',
                'slug' => 'documentacion-enviada',
                'description' => 'Documentación enviada a Air-e',
                'icon' => '📤',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Respuesta Air-e',
                'slug' => 'respuesta-aire',
                'description' => 'Respuesta recibida de Air-e',
                'icon' => '📨',
                'color' => '#ef4444',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Aprobación Recibida',
                'slug' => 'aprobacion-recibida',
                'description' => 'Aprobación recibida de Air-e',
                'icon' => '✅',
                'color' => '#22c55e',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Inicio de Instalación',
                'slug' => 'inicio-instalacion',
                'description' => 'Inicio de la instalación en sitio',
                'icon' => '🔧',
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Inspección Realizada',
                'slug' => 'inspeccion-realizada',
                'description' => 'Inspección realizada por Air-e',
                'icon' => '🔍',
                'color' => '#06b6d4',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Conexión Exitosa',
                'slug' => 'conexion-exitosa',
                'description' => 'Conexión exitosa al sistema eléctrico',
                'icon' => '⚡',
                'color' => '#10b981',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Entrega al Cliente',
                'slug' => 'entrega-cliente',
                'description' => 'Entrega formal del proyecto al cliente',
                'icon' => '🤝',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Observación/Problema',
                'slug' => 'observacion-problema',
                'description' => 'Observación o problema detectado',
                'icon' => '⚠️',
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Reunión',
                'slug' => 'reunion',
                'description' => 'Reunión relacionada con el proyecto',
                'icon' => '👥',
                'color' => '#64748b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Llamada Telefónica',
                'slug' => 'llamada-telefonica',
                'description' => 'Llamada telefónica de seguimiento',
                'icon' => '📞',
                'color' => '#06b6d4',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Visita Técnica',
                'slug' => 'visita-tecnica',
                'description' => 'Visita técnica al sitio del proyecto',
                'icon' => '🚗',
                'color' => '#3b82f6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Capacitación',
                'slug' => 'capacitacion',
                'description' => 'Capacitación al cliente o equipo',
                'icon' => '🎓',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Mantenimiento',
                'slug' => 'mantenimiento',
                'description' => 'Mantenimiento preventivo o correctivo',
                'icon' => '🔧',
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Insertar tipos de documento iniciales
        DB::table('document_types')->insert([
            [
                'name' => 'Contrato',
                'slug' => 'contrato',
                'description' => 'Contrato firmado',
                'icon' => '📄',
                'color' => '#3b82f6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Plano Técnico',
                'slug' => 'plano-tecnico',
                'description' => 'Planos técnicos del sistema',
                'icon' => '📐',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Certificado',
                'slug' => 'certificado',
                'description' => 'Certificados de equipos o instalación',
                'icon' => '🏆',
                'color' => '#10b981',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Factura',
                'slug' => 'factura',
                'description' => 'Factura de pago',
                'icon' => '💰',
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Foto',
                'slug' => 'foto',
                'description' => 'Fotografía del sitio o instalación',
                'icon' => '📸',
                'color' => '#06b6d4',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Acta',
                'slug' => 'acta',
                'description' => 'Acta de reunión o entrega',
                'icon' => '📋',
                'color' => '#64748b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Carta Air-e',
                'slug' => 'carta-aire',
                'description' => 'Carta u oficio de Air-e',
                'icon' => '✉️',
                'color' => '#ef4444',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Informe Técnico',
                'slug' => 'informe-tecnico',
                'description' => 'Informe técnico de avance o revisión',
                'icon' => '📊',
                'color' => '#8b5cf6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Permiso',
                'slug' => 'permiso',
                'description' => 'Permisos necesarios para la instalación',
                'icon' => '✅',
                'color' => '#22c55e',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Otro',
                'slug' => 'otro',
                'description' => 'Otro tipo de documento',
                'icon' => '📎',
                'color' => '#94a3b8',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    public function down()
    {
        DB::table('project_states')->truncate();
        DB::table('milestone_types')->truncate();
        DB::table('document_types')->truncate();
    }
};