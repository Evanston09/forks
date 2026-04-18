<?php

namespace App\Console\Commands;

use App\Enums\KillStatus;
use App\KillClaimResolution;
use App\Models\Kill;
use Illuminate\Console\Command;

class ApproveExpiredKills extends Command
{
    protected $signature = 'app:approve-expired-kills';

    protected $description = 'Approve expired pending kill claims';

    public function handle(KillClaimResolution $resolution): int
    {
        $processed = 0;

        $kills = Kill::query()
            ->where('status', KillStatus::Pending)
            ->where('expires_at', '<=', now())
            ->orderBy('id')
            ->get();

        foreach ($kills as $kill) {
            if ($resolution->approve($kill, 'auto_timeout')) {
                $processed++;
            }
        }

        $this->info("Approved {$processed} expired kill claim(s).");

        return self::SUCCESS;
    }
}
