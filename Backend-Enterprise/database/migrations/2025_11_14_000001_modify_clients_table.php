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
        // Combined migration - no changes needed as individual migrations already executed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Reverse add_responsible_user_id_to_clients_table
            $table->dropForeign(['responsible_user_id']);
            $table->dropColumn('responsible_user_id');

            // Reverse update_document_columns_to_nic
            if (Schema::hasColumn('clients', 'nic')) {
                $table->dropColumn('nic');
            }
            if (!Schema::hasColumn('clients', 'document_type')) {
                $table->string('document_type')->nullable()->after('email');
            }
            if (!Schema::hasColumn('clients', 'document_number')) {
                $table->string('document_number')->nullable()->after('document_type');
            }

            // Reverse add_monthly_consumption_column_to_clients_table
            $table->dropColumn('monthly_consumption');

            // Reverse remove_company_column_from_clients_table
            $table->string('company')->nullable();

            // Reverse add_client_type_to_clients_table
            $table->dropColumn('client_type');
        });

        // Reverse create_clients_table
        Schema::dropIfExists('clients');
    }
};
