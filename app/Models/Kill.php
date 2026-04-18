<?php

namespace App\Models;

use App\Enums\KillStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kill extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'killer_id',
        'victim_id',
        'status',
        'contest_reason',
        'is_ffa',
        'expires_at',
        'notification_sent_at',
        'resolved_at',
        'resolution_source',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => KillStatus::class,
            'is_ffa' => 'boolean',
            'expires_at' => 'datetime',
            'notification_sent_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function killer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'killer_id');
    }

    public function victim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'victim_id');
    }
}
