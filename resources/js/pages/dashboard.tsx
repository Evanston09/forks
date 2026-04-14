import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    type LucideIcon,
    MoonStar,
    ShieldMinus,
    Skull,
    Sun,
    Sunrise,
    Sword,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type DashboardProps = {
    summary: {
        total_players: number;
        alive_players: number;
        dead_players: number;
    };
    superlatives: {
        deadliest_hall: {
            label: string;
            kills: number;
            players: number;
        };
        deadliest_class: {
            label: string;
            kills: number;
            players: number;
        };
        quietest_hall: {
            label: string;
            kills: number;
            players: number;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

function getGreetingDetails(hour: number) {
    if (hour < 12) {
        return { message: 'Good morning', icon: Sunrise };
    }

    if (hour < 18) {
        return { message: 'Good afternoon', icon: Sun };
    }

    return { message: 'Good evening', icon: MoonStar };
}

function getCurrentGreetingDetails() {
    if (typeof window === 'undefined') {
        return getGreetingDetails(12);
    }

    return getGreetingDetails(new Date().getHours());
}

function StatCard({
    title,
    value,
    icon: Icon,
    description,
}: {
    title: string;
    value: React.ReactNode;
    icon: LucideIcon;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
                </div>
                <CardAction className="flex size-10 items-center justify-center self-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </CardAction>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                {description}
            </CardContent>
        </Card>
    );
}

function SuperlativeCard({
    title,
    label,
    kills,
    players,
    icon: Icon,
    description,
}: {
    title: string;
    label: string;
    kills: number;
    players: number;
    icon: LucideIcon;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 truncate text-2xl">
                        {label}
                    </CardTitle>
                </div>
                <CardAction className="flex size-10 items-center justify-center self-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-3xl font-semibold">{kills}</p>
                <p className="text-sm text-muted-foreground">
                    {kills === 1 ? 'kill' : 'kills'} from {players}{' '}
                    {players === 1 ? 'player' : 'players'}
                </p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ summary, superlatives }: DashboardProps) {
    const { auth } = usePage().props;
    const [greeting] = useState(getCurrentGreetingDetails);

    const GreetingIcon = greeting.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="flex-row items-center gap-3 py-8 sm:px-8">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <GreetingIcon className="size-6" />
                        </div>
                        <div>
                            <CardDescription className="uppercase">
                                Player dashboard
                            </CardDescription>
                            <CardTitle className="text-3xl tracking-tight sm:text-4xl">
                                {greeting.message}, {auth.user.name}
                            </CardTitle>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Players"
                        value={summary.total_players}
                        icon={Users}
                        description="Registered, non-admin players in the game."
                    />
                    <StatCard
                        title="Alive"
                        value={summary.alive_players}
                        icon={Activity}
                        description="Players still in the hunt right now."
                    />
                    <StatCard
                        title="Dead"
                        value={summary.dead_players}
                        icon={Skull}
                        description="Players who have already been eliminated."
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SuperlativeCard
                        title="Deadliest Hall"
                        label={superlatives.deadliest_hall.label}
                        kills={superlatives.deadliest_hall.kills}
                        players={superlatives.deadliest_hall.players}
                        icon={Sword}
                        description="Hall whose players have made the most kills."
                    />
                    <SuperlativeCard
                        title="Deadliest Class"
                        label={superlatives.deadliest_class.label}
                        kills={superlatives.deadliest_class.kills}
                        players={superlatives.deadliest_class.players}
                        icon={Activity}
                        description="Class year whose players have made the most kills."
                    />
                    <SuperlativeCard
                        title="Quietest Hall"
                        label={superlatives.quietest_hall.label}
                        kills={superlatives.quietest_hall.kills}
                        players={superlatives.quietest_hall.players}
                        icon={ShieldMinus}
                        description="Hall whose players have made the fewest kills."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
