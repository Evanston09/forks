<?php

namespace App\Models;

use App\Enums\GameStage;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'stage',
        'auth_open',
        'seniors_only_signup',
        'ffa',
        'show_real_names',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stage' => GameStage::class,
            'auth_open' => 'boolean',
            'seniors_only_signup' => 'boolean',
            'ffa' => 'boolean',
            'show_real_names' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrFail();
    }

    public function authIsOpen(): bool
    {
        return $this->auth_open;
    }
}
