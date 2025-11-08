<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'client_id',
        'quotation_id',
        'cost_center_id',
        'account_number',
        'project_type',
        'department',
        'municipality',
        'address',
        'coordinates',
        'capacity_dc',
        'capacity_ac',
        'nominal_power',
        'number_panels',
        'number_inverters',
        'inverter_manufacturer',
        'inverter_model',
        'voltage_level',
        'transformer_number',
        'connection_point',
        'excess_delivery',
        'contract_value',
        'contract_date',
        'responsible_commercial',
        'sales_channel',
        'average_ticket',
        'projected_revenue',
        'estimated_margin',
        'start_date',
        'application_date',
        'completeness_start_date',
        'completeness_end_date',
        'technical_review_start_date',
        'technical_review_end_date',
        'feasibility_concept_date',
        'installation_start_date',
        'installation_end_date',
        'inspection_requested_date',
        'inspection_performed_date',
        'final_approval_date',
        'connection_date',
        'estimated_completion_date',
        'current_state_id',
        'progress_percentage',
        'aire_observations',
        'corrective_actions',
        'internal_comments',
        'current_responsible',
        'next_action',
        'next_action_date',
        'additional_data',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'capacity_dc' => 'decimal:2',
        'capacity_ac' => 'decimal:2',
        'nominal_power' => 'decimal:2',
        'contract_value' => 'decimal:2',
        'average_ticket' => 'decimal:2',
        'projected_revenue' => 'decimal:2',
        'estimated_margin' => 'decimal:2',
        'start_date' => 'date',
        'contract_date' => 'date',
        'application_date' => 'date',
        'completeness_start_date' => 'date',
        'completeness_end_date' => 'date',
        'technical_review_start_date' => 'date',
        'technical_review_end_date' => 'date',
        'feasibility_concept_date' => 'date',
        'installation_start_date' => 'date',
        'installation_end_date' => 'date',
        'inspection_requested_date' => 'date',
        'inspection_performed_date' => 'date',
        'final_approval_date' => 'date',
        'connection_date' => 'date',
        'estimated_completion_date' => 'date',
        'next_action_date' => 'date',
        'additional_data' => 'array',
        'is_active' => 'boolean',
    ];

    // Relations
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function currentState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'current_state_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function stateHistory(): HasMany
    {
        return $this->hasMany(ProjectStateHistory::class);
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id', 'quotation_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id', 'cost_center_id');
    }

    // Accessors
    public function getProgressPercentageAttribute($value)
    {
        return (int) $value;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByProjectType($query, $projectType)
    {
        return $query->where('project_type', $projectType);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeByState($query, $stateId)
    {
        return $query->where('current_state_id', $stateId);
    }
}
