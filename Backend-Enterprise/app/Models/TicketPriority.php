<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Ticket;

class TicketPriority extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'color',
        'sla_hours',
        'order'
    ];

    /**
     * Relaciones
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'priority_id');
    }

    /**
     * Accesores
     */
    public function getColorClassAttribute()
    {
        $colors = [
            'baja' => 'text-blue-600 bg-blue-100',
            'media' => 'text-yellow-600 bg-yellow-100',
            'alta' => 'text-red-600 bg-red-100',
            'critica' => 'text-red-800 bg-red-200'
        ];

        return $colors[$this->name] ?? 'text-gray-600 bg-gray-100';
    }

    /**
     * Scopes
     */
    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('order', 'desc'); // Mayor orden = mayor prioridad
    }
}