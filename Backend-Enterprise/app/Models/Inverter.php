<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inverter extends Model
{
    use HasFactory;

    protected $primaryKey = 'inverter_id';

    protected $fillable = [
        'model',
        'brand',
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

    /**
     * Relación con productos usados en cotizaciones
     */
    public function usedProducts(): HasMany
    {
        return $this->hasMany(UsedProduct::class, 'product_id', 'inverter_id')
                    ->where('product_type', 'inverter');
    }

    /**
     * Verificar si el inversor está siendo usado en cotizaciones
     */
    public function isInUse(): bool
    {
        return $this->usedProducts()->exists();
    }
}
