<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Ticket;

class TicketState extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'color',
        'active',
        'is_final',
        'order'
    ];

    /**
     * Relaciones
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'status_id');
    }

    /**
     * Accesores
     */
    public function getColorClassAttribute()
    {
        $colors = [
            'Abierto' => 'text-red-600 bg-red-100',
            'En Proceso' => 'text-yellow-600 bg-yellow-100',
            'Esperando Cliente' => 'text-purple-600 bg-purple-100',
            'Esperando Repuestos' => 'text-yellow-600 bg-yellow-100',
            'Resuelto' => 'text-green-600 bg-green-100',
            'Cerrado' => 'text-gray-600 bg-gray-100',
            'Cancelado' => 'text-gray-500 bg-gray-200'
        ];

        return $colors[$this->name] ?? 'text-gray-600 bg-gray-100';
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeFinal($query)
    {
        return $query->where('is_final', true);
    }

    public function scopeOrderByOrder($query)
    {
        return $query->orderBy('order');
    }
}