<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $primaryKey = 'city_id';

    protected $fillable = [
        'name',
        'department_id',
    ];

    /**
     * Relación con departamento
     */
    public function department()
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id', 'department_id');
    }
}