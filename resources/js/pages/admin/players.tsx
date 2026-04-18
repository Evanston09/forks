import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import TargetController from '@/actions/App/Http/Controllers/Admin/TargetController';
import AlertError from '@/components/alert-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { players as playersRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Player = {
    id: number;
    name: string;
    nickname: string | null;
    email: string;
    phone: string | null;
    dorm_location: string | null;
    alive: boolean;
    total_kills: number;
    is_admin: boolean;
    current_target: {
        id: number;
        name: string;
        nickname: string | null;
    } | null;
    killed_by_user: {
        id: number;
        name: string;
        nickname: string | null;
    } | null;
};

type TargetRule = {
    id: number;
    player1: { id: number; name: string };
    player2: { id: number; name: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Players', href: playersRoute().url },
];

type PlayerOption = { value: number; label: string };

export default function Players({
    players,
    targetRules,
}: {
    players: Player[];
    targetRules: TargetRule[];
}) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [player1, setPlayer1] = useState<PlayerOption | null>(null);
    const [player2, setPlayer2] = useState<PlayerOption | null>(null);
    const playerOptions: PlayerOption[] = players
        .filter((p) => !p.is_admin)
        .map((p) => ({ value: p.id, label: p.name }));
    const ruleErrors = Object.values(errors);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Players" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex gap-3">
                    <Form {...TargetController.assignTargets.form()}>
                        <Button type="submit">Create Targets</Button>
                    </Form>
                    <Form {...TargetController.clearTargets.form()}>
                        <Button type="submit" variant="destructive">
                            Clear Targets
                        </Button>
                    </Form>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Target Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {targetRules.length > 0 && (
                            <div className="rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Player 1</TableHead>
                                            <TableHead>Player 2</TableHead>
                                            <TableHead className="w-24" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {targetRules.map((rule) => (
                                            <TableRow key={rule.id}>
                                                <TableCell>
                                                    {rule.player1.name}
                                                </TableCell>
                                                <TableCell>
                                                    {rule.player2.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Form
                                                        {...TargetController.destroy.form(
                                                            rule.id,
                                                        )}
                                                        method="delete"
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Form>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {ruleErrors.length > 0 && (
                            <AlertError errors={ruleErrors} />
                        )}
                        <Form
                            {...TargetController.store.form()}
                            resetOnSuccess
                            onSuccess={() => {
                                setPlayer1(null);
                                setPlayer2(null);
                            }}
                        >
                            <div className="flex gap-3">
                                <Combobox
                                    name="player_1"
                                    value={player1}
                                    onValueChange={setPlayer1}
                                    items={playerOptions}
                                    isItemEqualToValue={(item, val) =>
                                        item.value === val?.value
                                    }
                                >
                                    <ComboboxInput
                                        placeholder="Player 1"
                                        className="w-48"
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No players found.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(option) => (
                                                <ComboboxItem
                                                    key={option.value}
                                                    value={option}
                                                >
                                                    {option.label}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <Combobox
                                    name="player_2"
                                    value={player2}
                                    onValueChange={setPlayer2}
                                    items={playerOptions}
                                    isItemEqualToValue={(item, val) =>
                                        item.value === val?.value
                                    }
                                >
                                    <ComboboxInput
                                        placeholder="Player 2"
                                        className="w-48"
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No players found.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(option) => (
                                                <ComboboxItem
                                                    key={option.value}
                                                    value={option}
                                                >
                                                    {option.label}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <Button
                                    type="submit"
                                    disabled={
                                        !player1 ||
                                        !player2 ||
                                        player1.value === player2.value
                                    }
                                >
                                    Add Rule
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>

                <Separator />

                <div>
                    <p className="mb-3 text-sm text-muted-foreground">
                        {players.length} players
                    </p>
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Nickname</TableHead>
                                    <TableHead>Dorm</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Kills</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Killed By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.map((player) => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            {player.name}
                                            {player.is_admin && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2"
                                                >
                                                    Admin
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {player.nickname ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {player.dorm_location ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {player.phone ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {player.current_target
                                                ? player.current_target.name
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {player.total_kills}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    player.alive
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {player.alive
                                                    ? 'Alive'
                                                    : 'Dead'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {player.killed_by_user
                                                ? player.killed_by_user.name
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
