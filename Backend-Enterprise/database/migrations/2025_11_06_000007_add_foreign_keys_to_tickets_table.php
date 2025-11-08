<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Verificar si las tablas existen antes de agregar claves foráneas
        $existingTables = DB::select('SHOW TABLES');
        $tableNames = [];
        foreach ($existingTables as $table) {
            $tableArray = get_object_vars($table);
            $tableName = reset($tableArray);
            $tableNames[] = $tableName;
        }

        // Solo agregar claves foráneas si las tablas referenciadas existen
        if (in_array('users', $tableNames) && in_array('tickets', $tableNames)) {
            // Agregar clave foránea para created_by en tickets
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'created_by'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_created_by_foreign FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        if (in_array('ticket_types', $tableNames) && in_array('tickets', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'type_id'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_type_id_foreign FOREIGN KEY (type_id) REFERENCES ticket_types (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        if (in_array('ticket_priorities', $tableNames) && in_array('tickets', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'priority_id'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_priority_id_foreign FOREIGN KEY (priority_id) REFERENCES ticket_priorities (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        if (in_array('ticket_states', $tableNames) && in_array('tickets', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'status_id'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_status_id_foreign FOREIGN KEY (status_id) REFERENCES ticket_states (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        // Claves foráneas para ticket_attachments
        if (in_array('tickets', $tableNames) && in_array('ticket_attachments', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'ticket_attachments'
                AND COLUMN_NAME = 'ticket_id'")) {
                try {
                    DB::statement("ALTER TABLE ticket_attachments ADD CONSTRAINT ticket_attachments_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        if (in_array('users', $tableNames) && in_array('ticket_attachments', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'ticket_attachments'
                AND COLUMN_NAME = 'uploaded_by'")) {
                try {
                    DB::statement("ALTER TABLE ticket_attachments ADD CONSTRAINT ticket_attachments_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        // Claves foráneas para ticket_comments
        if (in_array('tickets', $tableNames) && in_array('ticket_comments', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'ticket_comments'
                AND COLUMN_NAME = 'ticket_id'")) {
                try {
                    DB::statement("ALTER TABLE ticket_comments ADD CONSTRAINT ticket_comments_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        if (in_array('users', $tableNames) && in_array('ticket_comments', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'ticket_comments'
                AND COLUMN_NAME = 'user_id'")) {
                try {
                    DB::statement("ALTER TABLE ticket_comments ADD CONSTRAINT ticket_comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE");
                } catch (\Exception $e) {
                    // Ignorar si ya existe
                }
            }
        }

        // Agregar claves foráneas para project_id y client_id si las tablas existen
        if (in_array('projects', $tableNames) && in_array('tickets', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'project_id'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_project_id_foreign FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL");
                } catch (\Exception $e) {
                    // Ignorar si ya existe o no se puede crear
                }
            }
        }

        if (in_array('clients', $tableNames) && in_array('tickets', $tableNames)) {
            if (!DB::select("SELECT * FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tickets'
                AND COLUMN_NAME = 'client_id'")) {
                try {
                    DB::statement("ALTER TABLE tickets ADD CONSTRAINT tickets_client_id_foreign FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL");
                } catch (\Exception $e) {
                    // Ignorar si ya existe o no se puede crear
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Eliminar claves foráneas de forma segura
        $foreignKeys = [
            ['table' => 'tickets', 'constraint' => 'tickets_created_by_foreign'],
            ['table' => 'tickets', 'constraint' => 'tickets_type_id_foreign'],
            ['table' => 'tickets', 'constraint' => 'tickets_priority_id_foreign'],
            ['table' => 'tickets', 'constraint' => 'tickets_status_id_foreign'],
            ['table' => 'tickets', 'constraint' => 'tickets_project_id_foreign'],
            ['table' => 'tickets', 'constraint' => 'tickets_client_id_foreign'],
            ['table' => 'ticket_attachments', 'constraint' => 'ticket_attachments_ticket_id_foreign'],
            ['table' => 'ticket_attachments', 'constraint' => 'ticket_attachments_uploaded_by_foreign'],
            ['table' => 'ticket_comments', 'constraint' => 'ticket_comments_ticket_id_foreign'],
            ['table' => 'ticket_comments', 'constraint' => 'ticket_comments_user_id_foreign']
        ];

        foreach ($foreignKeys as $fk) {
            try {
                DB::statement("ALTER TABLE {$fk['table']} DROP FOREIGN KEY IF EXISTS {$fk['constraint']}");
            } catch (\Exception $e) {
                // Ignorar si no existe
            }
        }
    }
};