<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $primaryKey = 'task_id';

    protected $fillable = [
        'title',
        'description',
        'status',
        'assigned_by_user_id',
        'assigned_to_user_id',
        'due_date',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relación con el usuario que asignó la tarea
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id', 'id');
    }

    // Relación muchos a muchos con los usuarios a los que se asignó la tarea
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'task_user', 'task_id', 'user_id');
    }

    // Relación con las evidencias fotográficas
    public function evidences()
    {
        return $this->hasMany(TaskEvidence::class, 'task_id', 'task_id');
    }
}