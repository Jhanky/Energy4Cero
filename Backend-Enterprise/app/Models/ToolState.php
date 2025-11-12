<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ToolState extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación con herramientas
    public function tools()
    {
        return $this->hasMany(Tool::class);
    }
}
