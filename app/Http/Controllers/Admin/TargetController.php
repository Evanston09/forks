<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TargetRule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TargetController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'player_1' => ['required', 'exists:users,id'],
            'player_2' => ['required', 'exists:users,id', 'different:player_1'],
        ]);

        $exists = TargetRule::query()
            ->where('player_1', $validated['player_1'])
            ->where('player_2', $validated['player_2'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['player_2' => 'A target rule already exists for these players.']);
        }

        TargetRule::create($validated);

        return back();
    }

    public function destroy(TargetRule $targetRule): RedirectResponse
    {
        $targetRule->delete();

        return back();
    }

    public function assignTargets(): RedirectResponse
    {
        return DB::transaction(function () {
            $players = User::query()
                ->where('is_admin', false)
                ->where('alive', true)
                ->get()
                ->shuffle()
                ->values();

            if ($players->count() < 2) {
                return back();
            }

            $targetRules = TargetRule::all();

            $targetRules->each(function ($targetRule) use (&$players) {
                $player1Index = $players->search(fn ($p) => $p->id === $targetRule->player_1);
                $player2Exists = $players->contains(fn ($p) => $p->id === $targetRule->player_2);

                if ($player1Index === false || ! $player2Exists) {
                    return;
                }

                $removedPlayer = $players->pull($player1Index);
                $players = $players->values();

                $player2Index = $players->search(fn ($p) => $p->id === $targetRule->player_2);
                $players->splice($player2Index, 0, [$removedPlayer]);
            });

            $players->each(function ($player, $index) use ($players) {
                $player->current_target_id = $players[($index + 1) % $players->count()]->id;
            });

            // Sort by id before saving to ensure a consistent lock acquisition order,
            // preventing deadlocks when concurrent requests update the same rows.
            $players->sortBy('id')->each(fn ($player) => $player->save());

            return back();
        });
    }

    public function clearTargets(): RedirectResponse
    {
        User::query()->update(['current_target_id' => null]);

        return back();
    }
}
