<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceEvidence extends Model
{
    use HasFactory;

    protected $table = 'maintenance_evidences';
    protected $primaryKey = 'evidence_id';

    protected $fillable = [
        'maintenance_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
        'uploaded_by',
    ];

    // Relación con el mantenimiento
    public function maintenance()
    {
        return $this->belongsTo(Maintenance::class, 'maintenance_id', 'maintenance_id');
    }

    // Relación con el usuario que subió la evidencia
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'id');
    }

    // Método para obtener la URL del archivo
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
