<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Battery extends Model
{
    use HasFactory;

    protected $primaryKey = 'battery_id';

    protected $fillable = [
        'name',
        'model',
        'type',
        'price',
        'ah_capacity',
        'voltage',
        'technical_sheet_path',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'ah_capacity' => 'decimal:2',
        'voltage' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
