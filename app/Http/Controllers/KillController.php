<?php

namespace App\Http\Controllers;

use App\Enums\GameStage;
use App\Enums\KillStatus;
use App\Mail\PlayerKilled;
use App\Models\Game;
use App\Models\Kill;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class KillController extends Controller
{
    public function index(): Response
    {
        abort_if(Auth::user()->is_admin, 403);

        $user = Auth::user()->load(['currentTarget:id,name,nickname', 'killedByUser:id,name,nickname']);
        $game = Game::current();

        $kill = Kill::with('killer:id,name,nickname')->where('victim_id', $user->id)->first();

        $alivePlayers = $game->ffa
            ? User::query()->where('alive', true)->where('is_admin', false)->where('id', '!=', $user->id)->get(['id', 'name', 'nickname'])
            : [];

        return Inertia::render('targets', [
            'target' => $user->currentTarget,
            'kill' => $kill,
            'alive_players' => $alivePlayers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_if(Auth::user()->is_admin, 403);

        $game = Game::current();

        if ($game->stage !== GameStage::Running) {
            return back()->withErrors(['victim_id' => 'The game is not running.', 'verification_name' => 'The game is not running.']);
        }

        $killer = Auth::user();
        if (! $killer->alive) {
            return back()->withErrors(['victim_id' => 'You are already eliminated.', 'verification_name' => 'You are already eliminated.']);
        }

        if ($game->ffa) {
            return $this->storeFfaKill($request, $killer);
        }

        return $this->storeNormalKill($request, $killer);
    }

    private function storeFfaKill(Request $request, User $killer): RedirectResponse
    {
        $request->validate([
            'victim_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        if ((int) $request->victim_id === $killer->id) {
            return back()->withErrors(['victim_id' => 'You cannot eliminate yourself.']);
        }

        $victim = User::find($request->victim_id);

        if (! $victim || ! $victim->alive) {
            return back()->withErrors(['victim_id' => 'That player is already eliminated.']);
        }

        if ($victim->is_admin) {
            return back()->withErrors(['victim_id' => 'You cannot eliminate an admin.']);
        }

        Kill::create([
            'killer_id' => $killer->id,
            'victim_id' => $victim->id,
            'status' => KillStatus::Pending,
            'is_ffa' => true,
        ]);

        return back();
    }

    private function storeNormalKill(Request $request, User $killer): RedirectResponse
    {
        $request->validate([
            'verification_name' => ['required', 'string'],
        ]);

        $victim = $killer->currentTarget;
        if (! $victim) {
            return back()->withErrors(['verification_name' => 'You have no target assigned.']);
        }

        $victimsTarget = $victim->currentTarget;
        if (! $victimsTarget) {
            return back()->withErrors(['verification_name' => 'Could not verify — target has no next target.']);
        }

        if (strtolower(trim($request->verification_name)) !== strtolower(trim($victimsTarget->name))) {
            return back()->withErrors(['verification_name' => 'Incorrect verification name.']);
        }

        $kill = Kill::create([
            'killer_id' => $killer->id,
            'victim_id' => $victim->id,
            'status' => KillStatus::Pending,
        ]);

        Mail::to("kim27e@ncssm.edu")->send(new PlayerKilled($kill, Carbon::now()->addHours(6)));

        return back();
    }

    public function approve(): RedirectResponse
    {
        $user = Auth::user();
        if ($user->alive) {
            return back();
        }

        $kill = Kill::where('victim_id', $user->id)->firstOrFail();

        if ($kill->contested) {
            return back()->withErrors(['kill' => 'Your kill has been contested and is pending admin review.']);
        }

        $kill->update(['status' => KillStatus::Approved]);

        return back();
    }

    public function contest(Request $request): RedirectResponse
    {
        $request->validate([
            'contest_reason' => ['required', 'string', 'max:1000'],
        ]);

        $user = Auth::user();
        if ($user->alive) {
            return back();
        }

        $kill = Kill::where('victim_id', $user->id)->firstOrFail();

        if ($kill->approved) {
            return back()->withErrors(['contest_reason' => 'This kill has already been approved.']);
        }

        if ($kill->contested) {
            return back()->withErrors(['contest_reason' => 'You have already contested this kill.']);
        }

        $kill->update([
            'status' => KillStatus::Contested,
            'contest_reason' => $request->contest_reason,
        ]);

        return back();
    }
}
