<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'project_id',
        'type_id',
        'date',
        'title',
        'description',
        'responsible_user_id', // Campo para almacenar ID de usuario responsable
        'participants',
        'notes',
        'order',
        'is_active',
        'created_by',
        'updated_by',
    ];

    // No usar $with aquí para evitar la carga automática innecesaria de participantes
    // protected $with = ['responsibleUser'];

    // Accesor para devolver el nombre del responsable
    public function getResponsibleAttribute()
    {
        // Si responsible_user_id está definido, devolver el nombre del usuario
        if ($this->responsible_user_id) {
            $user = $this->responsibleUser;
            if ($user) {
                return $user->name;
            }
        }
        // Si no hay relación, devolver el ID o un valor por defecto
        return $this->responsible_user_id ? "Usuario ID: {$this->responsible_user_id}" : null;
    }

    // Mutador para asignar el ID del usuario al responsable
    public function setResponsibleAttribute($value)
    {
        // Si el valor es numérico, asumir que es un ID y asignarlo al campo responsable_user_id
        if (is_numeric($value)) {
            $this->attributes['responsible_user_id'] = (int) $value;
        } else {
            // Si no es numérico, intentar buscar el usuario por nombre y obtener su ID
            // Esto es para compatibilidad con datos existentes
            $user = \App\Models\User::where('name', $value)->first();
            if ($user) {
                $this->attributes['responsible_user_id'] = $user->id;
            }
        }
    }

    protected $casts = [
        'date' => 'date',
        'participants' => 'array',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relations
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(MilestoneType::class, 'type_id');
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'milestone_id');
    }

    // Relación para obtener los participantes como usuarios
    public function participantUsers()
    {
        return $this->belongsToMany(User::class, 'milestone_user', 'milestone_id', 'user_id');
    }

    // Accessors
    public function getParticipantsAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    public function setParticipantsAttribute($value)
    {
        $this->attributes['participants'] = $value ? json_encode($value) : null;
    }
    
    // Método para obtener los detalles completos de los participantes
    public function getParticipantsWithDetailsAttribute()
    {
        $participantIds = $this->participants;
        if (empty($participantIds)) {
            return collect(); // Devolver colección vacía
        }
        
        // Convertir strings a integers si es necesario
        $participantIds = array_map('intval', array_filter($participantIds, function($id) {
            return $id !== null && $id !== '';
        }));
        
        if (empty($participantIds)) {
            return collect(); // Devolver colección vacía si no hay IDs válidos
        }
        
        return \App\Models\User::whereIn('id', $participantIds)->get(['id', 'name', 'email', 'position', 'department']);
    }
    
    // Método para transformar la respuesta de la API y incluir los detalles de participantes
    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
    
    // Método para personalizar el array de la API y devolver información detallada de participantes
    public function toArray()
    {
        $data = parent::toArray();
        
        // Si hay participantes en formato de IDs, obtener sus datos completos
        if (isset($data['participants']) && is_array($data['participants']) && !empty($data['participants'])) {
            // Convertir strings a integers si es necesario
            $participantIds = array_map('intval', array_filter($data['participants'], function($id) {
                return $id !== null && $id !== '';
            }));
            
            if (!empty($participantIds)) {
                $users = \App\Models\User::whereIn('id', $participantIds)->get(['id', 'name', 'email', 'position', 'department'])->toArray();
                $data['participant_users'] = $users; // Incluir usuarios participantes
            }
        }
        
        return $data;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByType($query, $typeId)
    {
        return $query->where('type_id', $typeId);
    }
}