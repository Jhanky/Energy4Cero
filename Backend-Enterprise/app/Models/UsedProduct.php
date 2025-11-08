<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsedProduct extends Model
{
    use HasFactory;

    protected $table = 'used_products';
    protected $primaryKey = 'used_product_id';

    protected $fillable = [
        'quotation_id',
        'product_type',
        'product_id',
        'brand',
        'model',
        'quantity',
        'unit_price',
        'profit_percentage',
        'partial_value',
        'profit',
        'total_value'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'profit_percentage' => 'decimal:3',
        'partial_value' => 'decimal:2',
        'profit' => 'decimal:2',
        'total_value' => 'decimal:2'
    ];

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id', 'quotation_id');
    }
}