<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'role_id';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'permissions',
        'is_active',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relación con los usuarios que tienen este rol
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Verificar si el rol tiene un permiso específico
     */
    public function hasPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Agregar un permiso al rol
     */
    public function addPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    /**
     * Remover un permiso del rol
     */
    public function removePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_values(array_filter($permissions, function($p) use ($permission) {
            return $p !== $permission;
        }));
        $this->permissions = $permissions;
        $this->save();
    }

    /**
     * Scope para roles activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para buscar por slug
     */
    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}
