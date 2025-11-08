<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationAdditionalItem extends Model
{
    use HasFactory;

    protected $table = 'quotation_items';
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'quotation_id',
        'description',
        'item_type',
        'quantity',
        'unit',
        'unit_price',
        'profit_percentage',
        'partial_value',
        'profit',
        'total_value'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
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

 