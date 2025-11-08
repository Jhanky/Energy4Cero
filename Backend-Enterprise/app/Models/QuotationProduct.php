<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class QuotationProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_id',
        'product_type',
        'product_id',
        'quantity',
        'unit_price',
        'utility_percentage',
        'partial_value',
        'utility_amount',
        'total'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'utility_percentage' => 'decimal:2',
        'partial_value' => 'decimal:2',
        'utility_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function product()
    {
        return match($this->product_type) {
            'panel' => $this->belongsTo(Panel::class, 'product_id'),
            'inverter' => $this->belongsTo(Inverter::class, 'product_id'),
            'battery' => $this->belongsTo(Battery::class, 'product_id'),
            default => null
        };
    }

    // Accessors
    public function getProductNameAttribute()
    {
        $product = $this->getProduct();
        if (!$product) return 'Producto no encontrado';
        
        return match($this->product_type) {
            'panel' => $product->brand . ' - ' . $product->model,
            'inverter' => $product->brand . ' - ' . $product->model,
            'battery' => $product->brand . ' - ' . $product->model,
            default => 'Producto desconocido'
        };
    }

    public function getFormattedUnitPriceAttribute()
    {
        return '$' . number_format($this->unit_price, 2, ',', '.');
    }

    public function getFormattedPartialValueAttribute()
    {
        return '$' . number_format($this->partial_value, 2, ',', '.');
    }

    public function getFormattedUtilityAmountAttribute()
    {
        return '$' . number_format($this->utility_amount, 2, ',', '.');
    }

    public function getFormattedTotalAttribute()
    {
        return '$' . number_format($this->total, 2, ',', '.');
    }

    // Métodos
    public function getProduct()
    {
        return match($this->product_type) {
            'panel' => Panel::find($this->product_id),
            'inverter' => Inverter::find($this->product_id),
            'battery' => Battery::find($this->product_id),
            default => null
        };
    }

    public function calculateTotals()
    {
        $this->partial_value = $this->quantity * $this->unit_price;
        $this->utility_amount = $this->partial_value * ($this->utility_percentage / 100);
        $this->total = $this->partial_value + $this->utility_amount;
        $this->save();
        
        return $this->total;
    }

    public function updateFromProduct($product)
    {
        $this->unit_price = $product->price;
        $this->calculateTotals();
    }
}
