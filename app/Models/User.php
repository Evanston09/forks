<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'nickname',
        'phone',
        'dorm_location',
        'profile_completed',
        'is_admin',
        'alive',
        'current_target_id',
        'total_kills',
        'killed_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'profile_completed' => 'boolean',
            'is_admin' => 'boolean',
            'alive' => 'boolean',
        ];
    }

    public function currentTarget(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_target_id');
    }

    public function killedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'killed_by');
    }
}
