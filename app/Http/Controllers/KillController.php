<?php

namespace App\Http\Controllers;

use App\Enums\GameStage;
use App\Enums\KillStatus;
use App\KillClaimResolution;
use App\Mail\PlayerKilled;
use App\Models\Game;
use App\Models\Kill;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class KillController extends Controller
{
    private const int TARGET_GUESS_MAX_ATTEMPTS = 5;

    private const int TARGET_GUESS_DECAY_SECONDS = 3600;

    public function index(): Response
    {
        abort_if(Auth::user()->is_admin, 403);

        $user = Auth::user()->load(['currentTarget:id,name,nickname', 'killedByUser:id,name,nickname']);
        $game = Game::current();
        $incomingClaim = $this->incomingClaimFor($user);
        $outgoingClaim = $this->outgoingClaimFor($user);

        $players = User::query()
            ->where('is_admin', false)
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'nickname', 'alive']);

        return Inertia::render('targets', [
            'target' => $outgoingClaim ? null : $user->currentTarget,
            'incoming_claim' => $incomingClaim,
            'outgoing_claim' => $outgoingClaim,
            'players' => $players,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_if(Auth::user()->is_admin, 403);

        $game = Game::current();

        if ($game->stage !== GameStage::Running) {
            return back()->withErrors(['victim_id' => 'The game is not running.', 'verification_id' => 'The game is not running.']);
        }

        $killer = Auth::user();
        if (! $killer->alive) {
            return back()->withErrors(['victim_id' => 'You are already eliminated.', 'verification_id' => 'You are already eliminated.']);
        }

        if ($this->outgoingClaimFor($killer)) {
            return back()->withErrors([
                'victim_id' => 'You already have a kill claim awaiting resolution.',
                'verification_id' => 'You already have a kill claim awaiting resolution.',
            ]);
        }

        if ($game->ffa) {
            $request->validate([
                'victim_id' => ['required', 'integer', 'exists:users,id'],
            ], [
                'victim_id.required' => 'Choose a player to eliminate.',
            ]);

            return $this->storeFfaKill($request, $killer);
        }

        $request->validate([
            'verification_id' => ['required', 'integer', 'exists:users,id'],
        ], [
            'verification_id.required' => 'Choose your target\'s next target.',
        ]);

        return $this->storeNormalKill($request, $killer);
    }

    private function storeFfaKill(Request $request, User $killer): RedirectResponse
    {
        $error = null;

        DB::transaction(function () use ($request, $killer, &$error): void {
            if ((int) $request->victim_id === $killer->id) {
                $error = ['victim_id' => 'You cannot eliminate yourself.'];

                return;
            }

            $currentKiller = User::query()->find($killer->id);
            $victim = User::query()->find((int) $request->victim_id);

            if (! $currentKiller || ! $currentKiller->alive) {
                $error = ['victim_id' => 'You are already eliminated.'];

                return;
            }

            if ($this->outgoingClaimFor($currentKiller)) {
                $error = ['victim_id' => 'You already have a kill claim awaiting resolution.'];

                return;
            }

            if (! $victim || ! $victim->alive) {
                $error = ['victim_id' => 'That player is already eliminated.'];

                return;
            }

            if ($victim->is_admin) {
                $error = ['victim_id' => 'You cannot eliminate an admin.'];

                return;
            }

            if ($this->victimHasUnresolvedClaim($victim->id)) {
                $error = ['victim_id' => 'That player already has a kill claim awaiting resolution.'];

                return;
            }

            $kill = Kill::create([
                'killer_id' => $currentKiller->id,
                'victim_id' => $victim->id,
                'status' => KillStatus::Pending,
                'is_ffa' => true,
                'expires_at' => now()->addHours(6),
            ]);

            $kill->loadMissing('victim');

            Mail::to($kill->victim->email)->send((new PlayerKilled($kill))->afterCommit());

            $kill->notification_sent_at = now();
            $kill->save();
        });

        return $error ? back()->withErrors($error) : back();
    }

    private function storeNormalKill(Request $request, User $killer): RedirectResponse
    {
        $error = null;

        DB::transaction(function () use ($request, $killer, &$error): void {
            $currentKiller = User::query()->find($killer->id);

            if (! $currentKiller || ! $currentKiller->alive) {
                $error = ['verification_id' => 'You are already eliminated.'];

                return;
            }

            if ($this->outgoingClaimFor($currentKiller)) {
                $error = ['verification_id' => 'You already have a kill claim awaiting resolution.'];

                return;
            }

            if (! $currentKiller->current_target_id) {
                $error = ['verification_id' => 'You have no target assigned.'];

                return;
            }

            $victim = User::query()
                ->with('currentTarget:id,name')
                ->find($currentKiller->current_target_id);

            if (! $victim || ! $victim->alive) {
                $error = ['verification_id' => 'Your target has already been eliminated.'];

                return;
            }

            if ($this->victimHasUnresolvedClaim($victim->id)) {
                $error = ['verification_id' => 'Your target already has a kill claim awaiting resolution.'];

                return;
            }

            $victimsTarget = $victim->currentTarget;
            if (! $victimsTarget) {
                $error = ['verification_id' => 'Could not verify — target has no next target.'];

                return;
            }

            $targetGuessKey = 'target-guess:'.$currentKiller->id.':'.$currentKiller->current_target_id;
            if (RateLimiter::tooManyAttempts($targetGuessKey, self::TARGET_GUESS_MAX_ATTEMPTS)) {
                $availableIn = RateLimiter::availableIn($targetGuessKey);

                $error = ['verification_id' => 'Too many incorrect guesses. Try again in '.$this->formatRateLimitDelay($availableIn).'.'];

                return;
            }

            if ((int) $request->verification_id !== $victimsTarget->id) {
                RateLimiter::increment($targetGuessKey, self::TARGET_GUESS_DECAY_SECONDS);

                $error = ['verification_id' => 'Incorrect verification target.'];

                return;
            }

            $kill = Kill::create([
                'killer_id' => $currentKiller->id,
                'victim_id' => $victim->id,
                'status' => KillStatus::Pending,
                'is_ffa' => false,
                'expires_at' => now()->addHours(6),
            ]);

            $kill->loadMissing('victim');

            Mail::to($kill->victim->email)->send((new PlayerKilled($kill))->afterCommit());

            $kill->notification_sent_at = now();
            $kill->save();
        });

        return $error ? back()->withErrors($error) : back();
    }

    private function formatRateLimitDelay(int $seconds): string
    {
        if ($seconds < 60) {
            return $seconds.' seconds';
        }

        return ceil($seconds / 60).' minutes';
    }

    public function approve(KillClaimResolution $resolution): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->alive) {
            return back()->withErrors(['kill' => 'You have already been eliminated.']);
        }

        $kill = Kill::query()
            ->where('victim_id', $user->id)
            ->where('status', KillStatus::Pending)
            ->latest()
            ->first();

        if (! $kill) {
            return back()->withErrors(['kill' => 'No pending kill claim is awaiting your approval.']);
        }

        if (! $resolution->approve($kill, 'victim')) {
            return back()->withErrors(['kill' => 'That kill claim could not be approved.']);
        }

        return back();
    }

    public function contest(Request $request, KillClaimResolution $resolution): RedirectResponse
    {
        $request->validate([
            'contest_reason' => ['required', 'string', 'max:1000'],
        ], [
            'contest_reason.required' => 'Explain why this kill claim is invalid.',
        ]);

        $user = Auth::user();
        if (! $user->alive) {
            return back()->withErrors(['contest_reason' => 'You have already been eliminated.']);
        }

        $kill = Kill::query()
            ->where('victim_id', $user->id)
            ->where('status', KillStatus::Pending)
            ->latest()
            ->first();

        if (! $kill) {
            return back()->withErrors(['contest_reason' => 'No pending kill claim is available to contest.']);
        }

        if (! $resolution->contest($kill, $request->contest_reason, 'victim')) {
            return back()->withErrors(['contest_reason' => 'That kill claim could not be contested.']);
        }

        return back();
    }

    private function incomingClaimFor(User $user): ?Kill
    {
        $query = Kill::with('killer:id,name,nickname')
            ->where('victim_id', $user->id);

        return $user->alive
            ? $query->whereIn('status', $this->unresolvedStatusValues())->latest()->first()
            : $query->where('status', KillStatus::Approved)->latest('resolved_at')->first();
    }

    private function outgoingClaimFor(User $user): ?Kill
    {
        return Kill::with('victim:id,name,nickname')
            ->where('killer_id', $user->id)
            ->whereIn('status', $this->unresolvedStatusValues())
            ->latest()
            ->first();
    }

    private function victimHasUnresolvedClaim(int $victimId): bool
    {
        return Kill::query()
            ->where('victim_id', $victimId)
            ->whereIn('status', $this->unresolvedStatusValues())
            ->exists();
    }

    /**
     * @return list<string>
     */
    private function unresolvedStatusValues(): array
    {
        return [
            KillStatus::Pending->value,
            KillStatus::Contested->value,
        ];
    }
}
