<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Ticket;
use App\Models\User;

class TicketComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'comment', 
        'metadata',
        'is_internal'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * Relaciones
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Accesores
     */
    public function getCreatedAtFormattedAttribute()
    {
        return \Carbon\Carbon::parse($this->created_at)->diffForHumans();
    }

    public function getCreatedAtFullAttribute()
    {
        return \Carbon\Carbon::parse($this->created_at)->format('d/m/Y H:i');
    }

    public function getUserNameAttribute()
    {
        return $this->user ? $this->user->name : 'Usuario eliminado';
    }

    public function getUserEmailAttribute()
    {
        return $this->user ? $this->user->email : 'correo no disponible';
    }

    /**
     * Mutadores
     */
    public function setCommentAttribute($value)
    {
        $this->attributes['comment'] = strip_tags(trim($value));
    }

    /**
     * Scopes
     */
    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}