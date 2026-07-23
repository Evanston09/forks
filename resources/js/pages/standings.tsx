import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { standings } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Player = {
    id: number;
    nickname: string | null;
    name: string | null;
    alive: boolean;
    total_kills: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Leaderboard', href: standings().url },
];

export default function Standings({ players }: { players: Player[] }) {
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const hasWinner =
        players.length > 1 &&
        players.filter((player) => player.alive).length === 1;

    useEffect(() => {
        const updateViewportSize = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewportSize();
        window.addEventListener('resize', updateViewportSize);

        return () => window.removeEventListener('resize', updateViewportSize);
    }, []);

    function displayName(player: Player) {
        if (player.name && player.nickname) {
            return `${player.nickname} — ${player.name}`;
        }
        return player.nickname ?? player.name ?? 'Unknown';
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leaderboard" />
            {hasWinner && viewportSize.width > 0 && viewportSize.height > 0 && (
                <Confetti
                    width={viewportSize.width}
                    height={viewportSize.height}
                    numberOfPieces={500}
                    style={{ position: 'fixed' }}
                />
            )}
            <div className="mx-auto w-full max-w-2xl px-4 py-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Kills</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player, i) => (
                            <TableRow
                                key={player.id}
                                className={
                                    player.alive
                                        ? undefined
                                        : 'text-muted-foreground'
                                }
                            >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell
                                    className={
                                        player.alive ? 'font-medium' : undefined
                                    }
                                >
                                    {displayName(player)}
                                </TableCell>
                                <TableCell>
                                    {player.alive ? (
                                        <Badge
                                            variant="outline"
                                            className="border-green-500 text-green-600 dark:text-green-400"
                                        >
                                            Alive
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-red-500 text-red-600 dark:text-red-400"
                                        >
                                            Dead
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {player.total_kills}
                                </TableCell>
                            </TableRow>
                        ))}
                        {players.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                >
                                    No players yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
