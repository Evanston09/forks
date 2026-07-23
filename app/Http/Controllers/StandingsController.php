<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class StandingsController extends Controller
{
    public function index(): Response
    {
        $game = Game::current();

        $players = User::query()
            ->where('is_admin', false)
            ->orderByDesc('alive')
            ->orderByDesc('total_kills')
            ->get(['id', 'nickname', 'name', 'alive', 'total_kills']);

        return Inertia::render('standings', [
            'players' => $players->map(fn (User $user) => [
                'id' => $user->id,
                'nickname' => $user->nickname,
                'name' => $game->show_real_names ? $user->name : null,
                'alive' => $user->alive,
                'total_kills' => $user->total_kills,
            ]),
        ]);
    }
}
