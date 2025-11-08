<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Ticket;

class TicketType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'color',
        'priority_level'
    ];

    /**
     * Relaciones
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'type_id');
    }

    /**
     * Accesores
     */
    public function getPriorityLevelFormattedAttribute()
    {
        $labels = [
            'baja' => 'Baja',
            'media' => 'Media',
            'alta' => 'Alta',
            'critica' => 'Crítica'
        ];

        return $labels[$this->priority_level] ?? ucfirst($this->priority_level);
    }

    /**
     * Scopes
     */
    public function scopeByPriorityLevel($query, $level)
    {
        return $query->where('priority_level', $level);
    }
}