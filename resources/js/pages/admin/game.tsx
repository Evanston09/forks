import type { RequestPayload } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import {
    enableFfa,
    update,
} from '@/actions/App/Http/Controllers/Admin/GameController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import AppLayout from '@/layouts/app-layout';
import { game as gameRoute } from '@/routes';
import type { AdminGameState, BreadcrumbItem } from '@/types';

type GameStats = {
    total: number;
    alive: number;
    dead: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: gameRoute().url },
];

const STAGES = [
    {
        value: 'pregame',
        label: 'Pregame',
        description:
            'Set up the game. Open logins so players can register and complete their profiles.',
        advanceLabel: 'Start Game',
        advanceDescription:
            'This will move the game to the running stage. Make sure targets are assigned.',
    },
    {
        value: 'running',
        label: 'Running',
        description:
            'Targets are assigned and eliminations are active. The game is live.',
        advanceLabel: 'End Game',
        advanceDescription:
            'This will end the game. Players will see final results.',
    },
    {
        value: 'postgame',
        label: 'Postgame',
        description:
            'Game over. Final results and stats are visible to all players.',
        advanceLabel: 'Reset to Pregame',
        advanceDescription:
            'This will reset the game back to the pregame stage.',
    },
] as const;

function ConfirmButton({
    title,
    description,
    onConfirm,
    children,
}: {
    title: string;
    description: string;
    onConfirm: () => void;
    children: React.ReactNode;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>{children}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function Game({ stats }: { stats: GameStats }) {
    const { game } = usePage().props as { game: AdminGameState };
    const currentIndex = STAGES.findIndex((s) => s.value === game.stage);
    const currentStage = STAGES[currentIndex];
    const nextStage = STAGES[(currentIndex + 1) % STAGES.length];

    function postUpdate(data: RequestPayload) {
        router.post(update().url, data, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid grid-cols-3 gap-4">
                    <Card className="py-4">
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">
                                Total Players
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="py-4">
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {stats.alive}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Alive
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="py-4">
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {stats.dead}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Dead
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {STAGES.map((stage, i) => {
                            const isCurrent = game.stage === stage.value;
                            return (
                                <Card
                                    key={stage.value}
                                    className={
                                        isCurrent
                                            ? 'border border-primary ring-2 ring-primary/20'
                                            : undefined
                                    }
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                                    isCurrent &&
                                                    'bg-primary text-primary-foreground'
                                                }`}
                                            >
                                                {i + 1}
                                            </div>
                                            <CardTitle className="text-sm">
                                                {stage.label}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {stage.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-4">
                        <ConfirmButton
                            title={currentStage.advanceLabel}
                            description={currentStage.advanceDescription}
                            onConfirm={() =>
                                postUpdate({ stage: nextStage.value })
                            }
                        >
                            {currentStage.advanceLabel}
                        </ConfirmButton>
                    </div>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Free For All</CardTitle>
                        <CardDescription>
                            Enable FFA mode — any player can eliminate any other
                            player. This cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {game.ffa ? (
                            <Button disabled variant="secondary">
                                FFA Active
                            </Button>
                        ) : (
                            <ConfirmButton
                                title="Enable Free For All"
                                description="This will switch the game to FFA mode. The target chain will be replaced — any alive player can eliminate any other. This cannot be undone."
                                onConfirm={() => router.post(enableFfa().url)}
                            >
                                Enable FFA
                            </ConfirmButton>
                        )}
                    </CardContent>
                </Card>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Real Names</CardTitle>
                        <CardDescription>
                            Show real names alongside nicknames on the public
                            leaderboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">
                                {game.show_real_names ? 'Shown' : 'Hidden'}
                            </span>
                            <Toggle
                                pressed={game.show_real_names}
                                onPressedChange={(pressed) =>
                                    postUpdate({ show_real_names: pressed })
                                }
                                aria-label="Toggle real names"
                            >
                                {game.show_real_names ? 'On' : 'Off'}
                            </Toggle>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Player Logins</CardTitle>
                        <CardDescription>
                            Allow players to log in and register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">
                                {game.auth_open ? 'Open' : 'Closed'}
                            </span>
                            <Toggle
                                pressed={game.auth_open}
                                onPressedChange={(pressed) =>
                                    postUpdate({ auth_open: pressed })
                                }
                                aria-label="Toggle player logins"
                            >
                                {game.auth_open ? 'On' : 'Off'}
                            </Toggle>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Seniors Only Signup</CardTitle>
                        <CardDescription>
                            Restrict signup to NCSSM emails containing 26. When
                            disabled, any @ncssm.edu address can sign up.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">
                                {game.seniors_only_signup
                                    ? 'Restricted to seniors'
                                    : 'Open to all NCSSM emails'}
                            </span>
                            <Toggle
                                pressed={game.seniors_only_signup}
                                onPressedChange={(pressed) =>
                                    postUpdate({
                                        seniors_only_signup: pressed,
                                    })
                                }
                                aria-label="Toggle seniors only signup"
                            >
                                {game.seniors_only_signup ? 'On' : 'Off'}
                            </Toggle>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
