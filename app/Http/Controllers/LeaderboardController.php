<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function index(): Response
    {
        $game = Game::current();

        $players = User::query()
            ->where('is_admin', false)
            ->orderByDesc('total_kills')
            ->get(['nickname', 'name', 'alive', 'total_kills']);

        return Inertia::render('leaderboard', [
            'players' => $players->map(fn (User $user) => [
                'nickname' => $user->nickname,
                'name' => $game->show_real_names ? $user->name : null,
                'alive' => $user->alive,
                'total_kills' => $user->total_kills,
            ]),
        ]);
    }
}
