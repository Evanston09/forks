import type { ReactNode } from 'react';
import type { KillClaim } from '@/components/targets/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function StateCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            {children ? <CardContent>{children}</CardContent> : null}
        </Card>
    );
}

export function ClaimMeta({ claim }: { claim: KillClaim }) {
    return (
        <div className="grid gap-2 text-sm text-muted-foreground">
            <p>Submitted: {formatTimestamp(claim.created_at)}</p>
            {claim.expires_at ? (
                <p>Response deadline: {formatTimestamp(claim.expires_at)}</p>
            ) : null}
            {claim.contest_reason ? (
                <p>Contest reason: {claim.contest_reason}</p>
            ) : null}
        </div>
    );
}

function formatTimestamp(value: string): string {
    return new Date(value).toLocaleString();
}
