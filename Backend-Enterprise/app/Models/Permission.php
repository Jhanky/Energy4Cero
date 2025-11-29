<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'module',
        'action',
        'key',
        'label',
        'description',
        'is_active',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope para permisos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para permisos por módulo
     */
    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope para buscar permisos
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('key', 'like', "%{$search}%")
              ->orWhere('label', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('module', 'like', "%{$search}%")
              ->orWhere('action', 'like', "%{$search}%");
        });
    }

    /**
     * Obtener permisos agrupados por módulo
     */
    public static function getGroupedByModule()
    {
        return static::active()
            ->orderBy('module')
            ->orderBy('action')
            ->get()
            ->groupBy('module')
            ->map(function($permissions) {
                return $permissions->map(function($permission) {
                    return [
                        'id' => $permission->id,
                        'key' => $permission->key,
                        'label' => $permission->label,
                        'action' => $permission->action,
                        'description' => $permission->description,
                    ];
                });
            });
    }

    /**
     * Obtener todos los módulos disponibles
     */
    public static function getModules()
    {
        return static::active()
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->toArray();
    }

    /**
     * Verificar si el permiso pertenece a un módulo
     */
    public function belongsToModule($module)
    {
        return $this->module === $module;
    }

    /**
     * Generar key automáticamente basado en module y action
     */
    public static function generateKey($module, $action)
    {
        return $module . '.' . $action;
    }

    /**
     * Generar label automáticamente
     */
    public static function generateLabel($module, $action)
    {
        $moduleLabels = [
            'users' => 'Usuarios',
            'roles' => 'Roles',
            'clients' => 'Clientes',
            'quotations' => 'Cotizaciones',
            'projects' => 'Proyectos',
            'inventory' => 'Inventario',
            'support' => 'Soporte',
            'financial' => 'Financiero',
            'commercial' => 'Comercial',
            'settings' => 'Configuración',
            'reports' => 'Reportes',
            'batteries' => 'Baterías',
            'panels' => 'Paneles',
            'inverters' => 'Inversores',
        ];

        $actionLabels = [
            'create' => 'Crear',
            'read' => 'Ver',
            'update' => 'Editar',
            'delete' => 'Eliminar',
            'export' => 'Exportar',
            'import' => 'Importar',
            'manage_roles' => 'Gestionar Roles',
            'approve' => 'Aprobar',
            'reports' => 'Reportes',
        ];

        $moduleLabel = $moduleLabels[$module] ?? ucfirst($module);
        $actionLabel = $actionLabels[$action] ?? ucfirst($action);

        return $actionLabel . ' ' . $moduleLabel;
    }
}
