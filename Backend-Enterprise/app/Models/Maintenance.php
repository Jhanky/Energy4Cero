<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $primaryKey = 'maintenance_id';

    protected $fillable = [
        'title',
        'description',
        'type',
        'status',
        'priority',
        'scheduled_date',
        'last_completed_date',
        'project_id',
        'created_by_user_id',
        'participants',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'last_completed_date' => 'date',
        'participants' => 'array',
    ];

    // Relación con el proyecto
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'id');
    }

    // Relación con el usuario que creó el mantenimiento
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'id');
    }

    // Relación con evidencias (similar a TaskEvidence)
    public function evidences()
    {
        return $this->hasMany(MaintenanceEvidence::class, 'maintenance_id', 'maintenance_id');
    }

    // Scope para mantenimientos por fecha
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    // Scope para mantenimientos pendientes
    public function scopePending($query)
    {
        return $query->whereIn('status', ['scheduled', 'overdue']);
    }

    // Scope para mantenimientos por proyecto
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }
}
