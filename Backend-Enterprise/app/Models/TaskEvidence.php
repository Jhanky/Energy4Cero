<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskEvidence extends Model
{
    use HasFactory;

    protected $primaryKey = 'evidence_id';

    protected $fillable = [
        'task_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
    ];

    // Relación con la tarea
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }
}