<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'client_id';

    protected $fillable = [
        'name',
        'client_type',
        'email',
        'phone',
        'nic',
        'responsible_user_id',
        'department_id',
        'city_id',
        'address',

        'monthly_consumption',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'monthly_consumption' => 'decimal:2',

    ];

    protected $appends = ['id'];

    /**
     * Accesor para el atributo id (para mantener compatibilidad con frontend)
     */
    public function getIdAttribute()
    {
        return $this->client_id;
    }

    /**
     * Accesor para el nombre del cliente
     */
    public function getNameAttribute($value)
    {
        return ucwords(strtolower($value));
    }

    /**
     * Mutator para el nombre del cliente
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower($value);
    }

    /**
     * Mutator para el email del cliente
     */
    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower($value);
    }

    /**
     * Relación con usuario responsable
     */
    public function responsibleUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'responsible_user_id');
    }

    /**
     * Relación con departamento
     */
    public function department()
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id', 'department_id');
    }

    /**
     * Relación con ciudad
     */
    public function city()
    {
        return $this->belongsTo(\App\Models\City::class, 'city_id', 'city_id');
    }

    /**
     * Relación con cotizaciones
     */
    public function quotations()
    {
        return $this->hasMany(\App\Models\Quotation::class, 'client_id', 'client_id');
    }

    /**
     * Relación con proyectos
     */
    public function projects()
    {
        return $this->hasMany(\App\Models\Project::class, 'client_id', 'client_id');
    }

    /**
     * Relación con tickets
     */
    public function tickets()
    {
        return $this->hasMany(\App\Models\Ticket::class, 'client_id', 'client_id');
    }



    /**
     * Scope para clientes activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para buscar por nombre, email, documento o ubicación
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('nic', 'like', "%{$search}%");
        });
    }
}
