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
        'public_signup_open',
        'seniors_only_signup',
        'ffa',
        'show_real_names',
        'rules_pdf_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stage' => GameStage::class,
            'public_signup_open' => 'boolean',
            'seniors_only_signup' => 'boolean',
            'ffa' => 'boolean',
            'show_real_names' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrFail();
    }
}
