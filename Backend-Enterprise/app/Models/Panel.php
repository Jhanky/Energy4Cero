<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Panel extends Model
{
    use HasFactory;

    protected $primaryKey = 'panel_id';

    protected $fillable = [
        'model',
        'brand',
        'power_output',
        'price',
        'technical_sheet_path',
        'is_active',
    ];

    protected $casts = [
        'power_output' => 'decimal:2',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
