<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inverter extends Model
{
    use HasFactory;

    protected $primaryKey = 'inverter_id';

    protected $fillable = [
        'name',
        'model',
        'power_output_kw',
        'grid_type',
        'system_type',
        'price',
        'technical_sheet_path',
        'is_active',
    ];

    protected $casts = [
        'power_output_kw' => 'decimal:2',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
