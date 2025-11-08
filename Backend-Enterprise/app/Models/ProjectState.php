<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectState extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'estimated_duration',
        'order',
        'is_active',
    ];

    protected $casts = [
        'estimated_duration' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relations
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'current_state_id');
    }

    public function projectHistories(): HasMany
    {
        return $this->hasMany(ProjectStateHistory::class, 'from_state_id')
            ->orWhere('to_state_id', $this->id);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}