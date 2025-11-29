<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMaterial extends Model
{
    use HasFactory;

    protected $table = 'project_materials';

    protected $fillable = [
        'project_id',
        'description',
        'quantity',
        'unit_measure',
        'category',
        'notes',
        'created_by',
        'is_in_project'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'is_in_project' => 'boolean'
    ];

    // Relación con proyecto
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // Relación con usuario que creó el material
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes útiles
    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeInProject($query)
    {
        return $query->where('is_in_project', true);
    }

    public function scopeNotInProject($query)
    {
        return $query->where('is_in_project', false);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
