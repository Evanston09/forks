import { ClaimMeta, StateCard } from '@/components/targets/shared';
import type { KillClaim } from '@/components/targets/types';

export function ContestedIncomingView({ claim }: { claim: KillClaim }) {
    return (
        <StateCard
            title="Claim Awaiting Admin Review"
            description="Your contest has been submitted. An admin must resolve this claim."
        >
            <ClaimMeta claim={claim} />
        </StateCard>
    );
}

export function EliminatedView({ claim }: { claim: KillClaim | null }) {
    const killerName = claim?.killer?.name ?? 'Unknown';

    return (
        <StateCard
            title="You've Been Eliminated"
            description={`Killed by ${killerName}.`}
        >
            {claim ? <ClaimMeta claim={claim} /> : null}
        </StateCard>
    );
}

export function OutgoingClaimView({ claim }: { claim: KillClaim }) {
    const victimName = claim.victim?.name ?? 'Unknown';
    const statusLabel =
        claim.status === 'contested'
            ? 'Contest received'
            : 'Claim pending verification';

    return (
        <StateCard
            title={statusLabel}
            description={`Your claim against ${victimName} is blocking new submissions until it is resolved.`}
        >
            <ClaimMeta claim={claim} />
        </StateCard>
    );
}
