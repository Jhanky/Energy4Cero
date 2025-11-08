<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $primaryKey = 'supplier_id';

    protected $fillable = [
        'name',
        'supplier_type',
        'email',
        'phone',
        'nit',
        'responsible_user_id',
        'department_id',
        'city_id',
        'address',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['id'];

    /**
     * Accesor para el atributo id (para mantener compatibilidad con frontend)
     */
    public function getIdAttribute()
    {
        return $this->supplier_id;
    }

    /**
     * Accesor para el nombre del proveedor
     */
    public function getNameAttribute($value)
    {
        return ucwords(strtolower($value));
    }

    /**
     * Mutator para el nombre del proveedor
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower($value);
    }

    /**
     * Mutator para el email del proveedor
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
     * Scope para proveedores activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para buscar por nombre, email, nit o ubicación
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('nit', 'like', "%{$search}%");
        });
    }
}
