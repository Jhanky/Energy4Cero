<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'original_name',
        'path',
        'mime_type',
        'size',
        'extension',
        'description',
        'type_id',
        'responsible',
        'date',
        'project_id',
        'milestone_id',
        'is_public',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'size' => 'integer',
        'date' => 'date',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relations
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'type_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByMilestone($query, $milestoneId)
    {
        return $query->where('milestone_id', $milestoneId);
    }

    public function scopeByType($query, $typeId)
    {
        return $query->where('type_id', $typeId);
    }

    public function scopeByExtension($query, $extension)
    {
        return $query->where('extension', $extension);
    }
}