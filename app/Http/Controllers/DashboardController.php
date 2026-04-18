<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // TODO: Simplify
    public function index(): Response
    {
        $players = User::query()->where('is_admin', false);

        $totalPlayers = (clone $players)->count();
        $alivePlayers = (clone $players)->where('alive', true)->count();

        return Inertia::render('dashboard', [
            'summary' => [
                'total_players' => $totalPlayers,
                'alive_players' => $alivePlayers,
                'dead_players' => $totalPlayers - $alivePlayers,
            ],
            'superlatives' => [
                'deadliest_hall' => $this->killLeadersByGroup('dorm_location', 'desc'),
                'deadliest_class' => $this->killLeadersByGroup('grade_year', 'desc'),
                'quietest_hall' => $this->killLeadersByGroup('dorm_location', 'asc'),
            ],
        ]);
    }

    /**
     * @return array{label: string, kills: int, players: int}
     */
    protected function killLeadersByGroup(string $column, string $direction): array
    {
        /** @var object|null $group */
        $group = User::query()
            ->leftJoin('kills', function ($join): void {
                $join->on('kills.killer_id', '=', 'users.id')
                    ->where('kills.status', '=', 'approved');
            })
            ->where('users.is_admin', false)
            ->selectRaw("
                COALESCE(NULLIF(TRIM(users.{$column}), ''), 'Unknown') as label,
                COUNT(kills.id) as kills,
                COUNT(DISTINCT users.id) as players
            ")
            ->groupBy(DB::raw("COALESCE(NULLIF(TRIM(users.{$column}), ''), 'Unknown')"))
            ->orderBy('kills', $direction)
            ->orderByDesc('players')
            ->orderBy('label')
            ->first();

        if (! $group) {
            return [
                'label' => 'Unknown',
                'kills' => 0,
                'players' => 0,
            ];
        }

        return [
            'label' => (string) $group->label,
            'kills' => (int) $group->kills,
            'players' => (int) $group->players,
        ];
    }
}
