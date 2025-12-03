<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Battery extends Model
{
    use HasFactory;

    protected $primaryKey = 'battery_id';

    protected $fillable = [
        'model',
        'brand',
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

    /**
     * Relación con productos usados en cotizaciones
     */
    public function usedProducts(): HasMany
    {
        return $this->hasMany(UsedProduct::class, 'product_id', 'battery_id')
                    ->where('product_type', 'battery');
    }

    /**
     * Verificar si la batería está siendo usada en cotizaciones
     */
    public function isInUse(): bool
    {
        return $this->usedProducts()->exists();
    }
}
