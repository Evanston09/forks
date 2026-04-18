<?php

namespace App;

use App\Enums\KillStatus;
use App\Models\Kill;
use Illuminate\Support\Facades\DB;

class KillClaimResolution
{
    public function approve(Kill $kill, string $source): bool
    {
        return DB::transaction(function () use ($kill, $source): bool {
            $claim = Kill::query()
                ->with(['killer', 'victim.currentTarget'])
                ->findOrFail($kill->id);

            if (! in_array($claim->status, [KillStatus::Pending, KillStatus::Contested], true)) {
                return false;
            }

            $killer = $claim->killer()->firstOrFail();
            $victim = $claim->victim()->firstOrFail();

            if ($victim->alive) {
                $victim->alive = false;
                $victim->killed_by = $killer->id;
                $victim->current_target_id = null;
                $victim->save();
            }

            if (! $claim->is_ffa && $killer->current_target_id === $victim->id) {
                $killer->current_target_id = $claim->victim->currentTarget?->id;
            }

            $killer->total_kills += 1;
            $killer->save();

            $claim->status = KillStatus::Approved;
            $claim->resolved_at = now();
            $claim->resolution_source = $source;
            $claim->save();

            return true;
        });
    }

    public function contest(Kill $kill, string $reason, string $source): bool
    {
        return DB::transaction(function () use ($kill, $reason, $source): bool {
            $claim = Kill::query()->findOrFail($kill->id);

            if ($claim->status !== KillStatus::Pending) {
                return false;
            }

            $claim->status = KillStatus::Contested;
            $claim->contest_reason = $reason;
            $claim->resolution_source = $source;
            $claim->save();

            return true;
        });
    }

    public function deny(Kill $kill, string $source): bool
    {
        return DB::transaction(function () use ($kill, $source): bool {
            $claim = Kill::query()->findOrFail($kill->id);

            if (! in_array($claim->status, [KillStatus::Pending, KillStatus::Contested], true)) {
                return false;
            }

            $claim->status = KillStatus::Denied;
            $claim->resolved_at = now();
            $claim->resolution_source = $source;
            $claim->save();

            return true;
        });
    }
}
