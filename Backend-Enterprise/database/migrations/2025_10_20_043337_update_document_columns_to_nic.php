<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Eliminar columnas antiguas
            if (Schema::hasColumn('clients', 'document_type')) {
                $table->dropColumn('document_type');
            }
            
            if (Schema::hasColumn('clients', 'document_number')) {
                $table->dropColumn('document_number');
            }
            
            // Añadir columna NIC
            if (!Schema::hasColumn('clients', 'nic')) {
                $table->string('nic')->nullable()->after('client_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Eliminar columna NIC
            if (Schema::hasColumn('clients', 'nic')) {
                $table->dropColumn('nic');
            }
            
            // Recuperar columnas antiguas
            if (!Schema::hasColumn('clients', 'document_type')) {
                $table->string('document_type')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('clients', 'document_number')) {
                $table->string('document_number')->nullable()->after('document_type');
            }
        });
    }
};
