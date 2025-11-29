<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     * Relación con productos usados en cotizaciones
     */
    public function usedProducts(): HasMany
    {
        return $this->hasMany(UsedProduct::class, 'product_id', 'panel_id')
                    ->where('product_type', 'panel');
    }

    /**
     * Verificar si el panel está siendo usado en cotizaciones
     */
    public function isInUse(): bool
    {
        return $this->usedProducts()->exists();
    }
}
