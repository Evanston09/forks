import { Form, Head, usePage } from '@inertiajs/react';
import {
    approve,
    deny,
} from '@/actions/App/Http/Controllers/Admin/KillController';
import AlertError from '@/components/alert-error';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { kills as killsRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type KillRecord = {
    id: number;
    killer: { id: number; name: string };
    victim: { id: number; name: string };
    status: 'pending' | 'contested' | 'approved' | 'denied';
    is_ffa: boolean;
    contest_reason: string | null;
    created_at: string;
    expires_at: string | null;
    notification_sent_at: string | null;
    resolved_at: string | null;
    resolution_source: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kills', href: killsRoute().url },
];

export default function Kills({ kills }: { kills: KillRecord[] }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const errorList = Object.values(errors ?? {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kills" />
            <div className="flex flex-col gap-6 p-4">
                {errorList.length > 0 ? (
                    <AlertError errors={errorList} />
                ) : null}
                <Card>
                    <CardHeader>
                        <CardTitle>Kill Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {kills.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No kill claims yet.
                            </p>
                        ) : (
                            <div className="rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Killer</TableHead>
                                            <TableHead>Victim</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>
                                                Contest Reason
                                            </TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Deadline</TableHead>
                                            <TableHead>Email Sent</TableHead>
                                            <TableHead>Resolved</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kills.map((kill) => (
                                            <TableRow key={kill.id}>
                                                <TableCell>
                                                    {kill.killer.name}
                                                </TableCell>
                                                <TableCell>
                                                    {kill.victim.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {kill.is_ffa ? (
                                                            <Badge variant="secondary">
                                                                FFA
                                                            </Badge>
                                                        ) : null}
                                                        <StatusBadge
                                                            status={kill.status}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs text-sm text-muted-foreground">
                                                    {kill.contest_reason ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatTimestamp(
                                                        kill.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {kill.expires_at
                                                        ? formatTimestamp(
                                                              kill.expires_at,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {kill.notification_sent_at
                                                        ? formatTimestamp(
                                                              kill.notification_sent_at,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {kill.resolved_at
                                                        ? formatTimestamp(
                                                              kill.resolved_at,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {kill.resolution_source ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <ClaimActions kill={kill} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function ClaimActions({ kill }: { kill: KillRecord }) {
    const isActionable =
        kill.status === 'pending' || kill.status === 'contested';

    if (!isActionable) {
        return <span className="text-sm text-muted-foreground">Resolved</span>;
    }

    return (
        <div className="flex gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm">Approve</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will confirm the claim against{' '}
                            {kill.victim.name} and apply the gameplay
                            elimination.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Form {...approve.form(kill.id)}>
                            <AlertDialogAction type="submit">
                                Approve
                            </AlertDialogAction>
                        </Form>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        Deny
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deny Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deny the claim and unlock both players for
                            future submissions without changing gameplay state.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Form {...deny.form(kill.id)}>
                            <AlertDialogAction type="submit">
                                Deny
                            </AlertDialogAction>
                        </Form>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function StatusBadge({ status }: { status: KillRecord['status'] }) {
    if (status === 'approved') {
        return <Badge>Approved</Badge>;
    }

    if (status === 'contested') {
        return <Badge variant="destructive">Contested</Badge>;
    }

    if (status === 'denied') {
        return <Badge variant="outline">Denied</Badge>;
    }

    return <Badge variant="outline">Pending</Badge>;
}

function formatTimestamp(value: string): string {
    return new Date(value).toLocaleString();
}
