<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectStateHistory extends Model
{
    use HasFactory;

    protected $table = 'project_state_history'; // Especificar el nombre exacto de la tabla

    protected $fillable = [
        'project_id',
        'from_state_id',
        'to_state_id',
        'reason',
        'changed_by',
        'changed_at',
        'additional_data',
    ];

    protected $casts = [
        'changed_by' => 'integer',
        'changed_at' => 'datetime',
        'additional_data' => 'array',
    ];

    // Relations
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function fromState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'from_state_id');
    }

    public function toState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'to_state_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    // Scopes
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByFromState($query, $stateId)
    {
        return $query->where('from_state_id', $stateId);
    }

    public function scopeByToState($query, $stateId)
    {
        return $query->where('to_state_id', $stateId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('changed_at', '>=', now()->subDays($days));
    }
}
