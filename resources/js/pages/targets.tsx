import { Head, usePage } from '@inertiajs/react';
import FfaTargetView from '@/components/targets/ffa-target-view';
import PendingVerificationView from '@/components/targets/pending-verification-view';
import { StateCard } from '@/components/targets/shared';
import {
    ContestedIncomingView,
    EliminatedView,
    OutgoingClaimView,
} from '@/components/targets/status-views';
import TargetView from '@/components/targets/target-view';
import type {
    AlivePlayer,
    KillClaim,
    Target,
} from '@/components/targets/types';
import AppLayout from '@/layouts/app-layout';
import { targets } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Targets', href: targets().url },
];

export default function Targets({
    target,
    incoming_claim,
    outgoing_claim,
    alive_players,
}: {
    target: Target | null;
    incoming_claim: KillClaim | null;
    outgoing_claim: KillClaim | null;
    alive_players: AlivePlayer[];
}) {
    const { game, auth } = usePage().props;
    const user = auth.user;
    let content: React.ReactNode;

    if (game.stage !== 'running') {
        content = (
            <StateCard
                title={
                    game.stage === 'pregame' ? 'Game Not Started' : 'Game Over'
                }
                description={
                    game.stage === 'pregame'
                        ? "The game hasn't started yet. Hang tight."
                        : 'The game is over. Check the results.'
                }
            />
        );
    } else if (!user.alive) {
        content = <EliminatedView claim={incoming_claim} />;
    } else if (incoming_claim?.status === 'pending') {
        content = <PendingVerificationView claim={incoming_claim} />;
    } else if (incoming_claim?.status === 'contested') {
        content = <ContestedIncomingView claim={incoming_claim} />;
    } else if (outgoing_claim) {
        content = <OutgoingClaimView claim={outgoing_claim} />;
    } else {
        content = game.ffa ? (
            <FfaTargetView alivePlayers={alive_players} />
        ) : (
            <TargetView target={target} />
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Targets" />
            <div className="flex flex-1 items-center justify-center p-4">
                {content}
            </div>
        </AppLayout>
    );
}
