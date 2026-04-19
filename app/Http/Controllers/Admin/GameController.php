<?php

namespace App\Http\Controllers\Admin;

use App\Enums\GameStage;
use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function index(): Response
    {
        $game = Game::current();
        $total = User::query()->where('is_admin', false)->count();
        $alive = User::query()->where('is_admin', false)->where('alive', true)->count();

        return Inertia::render('admin/game', [
            'game' => [
                'stage' => $game->stage->value,
                'auth_open' => $game->authIsOpen(),
                'seniors_only_signup' => $game->seniors_only_signup,
                'ffa' => $game->ffa,
                'show_real_names' => $game->show_real_names,
                'start' => config('game.start'),
            ],
            'stats' => [
                'total' => $total,
                'alive' => $alive,
                'dead' => $total - $alive,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => ['sometimes', Rule::enum(GameStage::class)],
            'auth_open' => ['sometimes', 'boolean'],
            'seniors_only_signup' => ['sometimes', 'boolean'],
            'show_real_names' => ['sometimes', 'boolean'],
        ]);

        Game::current()->update($validated);

        return to_route('game');
    }

    public function enableFfa(): RedirectResponse
    {
        $game = Game::current();

        if (! $game->ffa) {
            $game->update(['ffa' => true]);
        }

        return back();
    }
}
