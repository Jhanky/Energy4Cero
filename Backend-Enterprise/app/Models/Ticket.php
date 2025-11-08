<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use App\Models\TicketType;
use App\Models\TicketPriority;
use App\Models\TicketState;
use App\Models\TicketAttachment;
use App\Models\TicketComment;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_code',
        'project_id', 
        'client_id', 
        'title', 
        'description', 
        'type_id',
        'priority_id',
        'status_id', 
        'assigned_to',
        'created_by',
        'due_date',
        'resolution_date'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'resolution_date' => 'datetime'
    ];

    protected $dates = [
        'due_date',
        'resolution_date'
    ];

    /**
     * Generar código único para el ticket
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->ticket_code) {
                $model->ticket_code = self::generateUniqueTicketCode();
            }
        });
    }

    public static function generateUniqueTicketCode()
    {
        do {
            $year = date('Y');
            $randomNumber = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $ticketCode = "TK-{$year}-{$randomNumber}";
        } while (self::where('ticket_code', $ticketCode)->exists());

        return $ticketCode;
    }

    /**
     * Relaciones
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class, 'type_id');
    }

    public function ticketPriority()
    {
        return $this->belongsTo(TicketPriority::class, 'priority_id');
    }

    public function ticketState()
    {
        return $this->belongsTo(TicketState::class, 'status_id');
    }

    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scopes
     */
    public function scopeAbiertos($query)
    {
        return $query->whereHas('ticketState', function ($q) {
            $q->where('name', 'Abierto');
        });
    }

    public function scopeEnProceso($query)
    {
        return $query->whereHas('ticketState', function ($q) {
            $q->whereIn('name', ['En Proceso', 'Esperando Cliente', 'Esperando Repuestos']);
        });
    }

    public function scopeResueltos($query)
    {
        return $query->whereHas('ticketState', function ($q) {
            $q->where('name', 'Resuelto');
        });
    }

    public function scopeCerrados($query)
    {
        return $query->whereHas('ticketState', function ($q) {
            $q->whereIn('name', ['Cerrado', 'Cancelado']);
        });
    }

    public function scopeCriticos($query)
    {
        return $query->whereHas('ticketPriority', function ($q) {
            $q->where('name', 'Crítica');
        });
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->whereHas('ticketState', function ($q) use ($estado) {
            $q->where('name', $estado);
        });
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->whereHas('ticketType', function ($q) use ($tipo) {
            $q->where('name', $tipo);
        });
    }

    public function scopePorPrioridad($query, $prioridad)
    {
        return $query->whereHas('ticketPriority', function ($q) use ($prioridad) {
            $q->where('name', $prioridad);
        });
    }

    /**
     * Accesores y mutadores
     */
    public function getCreatedAtAttribute($value)
    {
        return \Carbon\Carbon::parse($value)->format('d/m/Y H:i');
    }

    public function getDueDateAttribute($value)
    {
        return $value ? \Carbon\Carbon::parse($value)->format('d/m/Y H:i') : null;
    }

    public function getResolutionDateAttribute($value)
    {
        return $value ? \Carbon\Carbon::parse($value)->format('d/m/Y H:i') : null;
    }

}
