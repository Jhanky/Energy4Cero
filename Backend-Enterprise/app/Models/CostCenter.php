<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostCenter extends Model
{
    use HasFactory;

    protected $primaryKey = 'cost_center_id';

    protected $fillable = [
        'code',
        'name',
        'type',
        'description',
        'responsible_user_id',
        'budget',
        'status',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'status' => 'string',
        'responsible_user_id' => 'integer',
    ];

    protected $appends = ['id', 'projects_count'];

    /**
     * Accesor para el atributo id (para mantener compatibilidad con frontend)
     */
    public function getIdAttribute()
    {
        return $this->cost_center_id;
    }

    /**
     * Accesor para el nombre del centro de costos
     */
    public function getNameAttribute($value)
    {
        return ucwords(strtolower($value));
    }

    /**
     * Mutator para el nombre del centro de costos
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower($value);
    }

    /**
     * Accesor para el código del centro de costos
     */
    public function getCodeAttribute($value)
    {
        return strtoupper($value);
    }

    /**
     * Mutator para el código del centro de costos
     */
    public function setCodeAttribute($value)
    {
        $this->attributes['code'] = strtoupper($value);
    }

    /**
     * Relación con usuario responsable
     */
    public function responsibleUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'responsible_user_id');
    }

    /**
     * Relación con proyectos
     */
    public function projects()
    {
        return $this->hasMany(\App\Models\Project::class, 'cost_center_id', 'cost_center_id');
    }

    /**
     * Scope para centros de costos activos
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'activo');
    }

    /**
     * Scope para buscar por nombre, código o descripción
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope para filtrar por tipo
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Calcular el monto gastado (por ahora retorna 0, se puede extender con lógica de gastos)
     */
    public function getSpentAttribute()
    {
        // TODO: Implementar lógica para calcular gastos reales
        // Por ahora retorna 0 para compatibilidad con frontend
        return 0;
    }

    /**
     * Calcular el monto disponible
     */
    public function getAvailableAttribute()
    {
        if ($this->type !== 'Proyecto' || !$this->budget) {
            return null;
        }

        return $this->budget - $this->spent;
    }

    /**
     * Calcular el porcentaje de uso
     */
    public function getUsagePercentageAttribute()
    {
        if ($this->type !== 'Proyecto' || !$this->budget || $this->budget == 0) {
            return 0;
        }

        return round(($this->spent / $this->budget) * 100, 2);
    }

    /**
     * Obtener el nombre completo para display
     */
    public function getFullNameAttribute()
    {
        return $this->code . ' - ' . $this->name;
    }

    /**
     * Contar proyectos asociados
     */
    public function getProjectsCountAttribute()
    {
        return $this->projects()->count();
    }
}
