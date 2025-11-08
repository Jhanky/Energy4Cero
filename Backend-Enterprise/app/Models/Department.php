<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $primaryKey = 'department_id';

    protected $fillable = [
        'name',
    ];

    /**
     * Relación con ciudades
     */
    public function cities()
    {
        return $this->hasMany(\App\Models\City::class, 'department_id', 'department_id');
    }
}