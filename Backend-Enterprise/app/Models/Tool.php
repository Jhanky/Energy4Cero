<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'purchase_price',
        'supplier',
        'warehouse_id',
        'project_id',
        'tool_state_id',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relación con bodega
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    // Relación con proyecto
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Relación con estado de herramienta
    public function toolState()
    {
        return $this->belongsTo(ToolState::class);
    }

    // Método para obtener la ubicación actual
    public function getCurrentLocationAttribute()
    {
        if ($this->warehouse) {
            return [
                'type' => 'warehouse',
                'location' => $this->warehouse->name,
                'id' => $this->warehouse->id
            ];
        } elseif ($this->project) {
            return [
                'type' => 'project',
                'location' => $this->project->name,
                'id' => $this->project->id
            ];
        }

        return [
            'type' => 'unknown',
            'location' => 'Sin ubicación asignada',
            'id' => null
        ];
    }
}
