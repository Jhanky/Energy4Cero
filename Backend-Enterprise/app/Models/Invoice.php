<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $primaryKey = 'invoice_id';

    protected $fillable = [
        'supplier_id',
        'cost_center_id',
        'invoice_number',
        'amount_before_iva',
        'total_value',
        'status',
        'payment_type',
        'issue_date',
        'due_date',
        'file_path',
        'notes',
    ];

    protected $casts = [
        'amount_before_iva' => 'decimal:2',
        'total_value' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    protected $appends = ['id'];

    /**
     * Accesor para el atributo id (para mantener compatibilidad con frontend)
     */
    public function getIdAttribute()
    {
        return $this->invoice_id;
    }

    /**
     * Relación con proveedor
     */
    public function supplier()
    {
        return $this->belongsTo(\App\Models\Supplier::class, 'supplier_id', 'supplier_id');
    }

    /**
     * Relación con centro de costos
     */
    public function costCenter()
    {
        return $this->belongsTo(\App\Models\CostCenter::class, 'cost_center_id', 'cost_center_id');
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por tipo de pago
     */
    public function scopeByPaymentType($query, $paymentType)
    {
        return $query->where('payment_type', $paymentType);
    }

    /**
     * Scope para buscar por número de factura
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('invoice_number', 'like', "%{$search}%")
              ->orWhereHas('supplier', function($supplierQuery) use ($search) {
                  $supplierQuery->where('name', 'like', "%{$search}%");
              })
              ->orWhereHas('costCenter', function($costCenterQuery) use ($search) {
                  $costCenterQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('code', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Scope para filtrar por rango de fechas
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('issue_date', [$startDate, $endDate]);
    }

    /**
     * Scope para facturas pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    /**
     * Scope para facturas pagadas
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'pagada');
    }

    /**
     * Calcular el IVA (asumiendo 19% en Colombia)
     */
    public function getIvaAttribute()
    {
        return $this->total_value - $this->amount_before_iva;
    }

    /**
     * Obtener el porcentaje de IVA
     */
    public function getIvaPercentageAttribute()
    {
        if ($this->amount_before_iva == 0) {
            return 0;
        }
        return round(($this->iva / $this->amount_before_iva) * 100, 2);
    }

    /**
     * Verificar si la factura está vencida
     */
    public function getIsOverdueAttribute()
    {
        if (!$this->due_date || $this->status === 'pagada') {
            return false;
        }
        return now()->isAfter($this->due_date);
    }

    /**
     * Obtener días hasta el vencimiento
     */
    public function getDaysUntilDueAttribute()
    {
        if (!$this->due_date) {
            return null;
        }
        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Obtener nombre completo para display
     */
    public function getFullNameAttribute()
    {
        return $this->invoice_number . ' - ' . ($this->supplier->name ?? 'Proveedor no encontrado');
    }
}
