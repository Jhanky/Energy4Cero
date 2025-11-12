<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materials';
    protected $primaryKey = 'id';

    protected $fillable = [
        'product_id',
        'description',
        'quantity',
        'unit_measure',
        'category',
        'warehouse_id',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    // Relación con bodega
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id', 'id');
    }

    // Scope para materiales activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope para materiales con stock bajo (menos de 10 unidades)
    public function scopeLowStock($query)
    {
        return $query->where('quantity', '<', 10);
    }

    // Scope para filtrar por categoría
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Scope para filtrar por bodega
    public function scopeByWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }
}
