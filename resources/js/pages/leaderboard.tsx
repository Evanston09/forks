import { Head } from '@inertiajs/react';
import HeroHeader from '@/components/hero-header';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Player = {
    nickname: string | null;
    name: string | null;
    alive: boolean;
    total_kills: number;
};

export default function Leaderboard({ players }: { players: Player[] }) {
    function displayName(player: Player) {
        if (player.name && player.nickname) {
            return `${player.nickname} — ${player.name}`;
        }
        return player.nickname ?? player.name ?? 'Unknown';
    }

    return (
        <>
            <Head title="Leaderboard" />
            <HeroHeader />
            <div className="mx-auto max-w-2xl px-4 pt-24 pb-12">
                <h1 className="mb-6 text-3xl font-bold tracking-tight">
                    Leaderboard
                </h1>
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
                                key={i}
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
        </>
    );
}
