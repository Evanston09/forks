import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Gamepad2,
    LayoutGrid,
    Skull,
    Target,
    Trophy,
    Users,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    dashboard,
    game,
    kills,
    players,
    rules,
    standings,
    targets,
} from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Targets',
        href: targets(),
        icon: Target,
    },
    {
        title: 'Leaderboard',
        href: standings(),
        icon: Trophy,
    },
    {
        title: 'Rules',
        href: rules(),
        icon: BookOpen,
        external: true,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Game',
        href: game(),
        icon: Gamepad2,
    },
    {
        title: 'Players',
        href: players(),
        icon: Users,
    },
    {
        title: 'Kills',
        href: kills(),
        icon: Skull,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={dashboard()}
                                prefetch
                                className="group-data-[collapsible=icon]:justify-center"
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={
                        auth.user.is_admin
                            ? mainNavItems.filter((i) => i.title !== 'Targets')
                            : mainNavItems
                    }
                />
                {auth.user.is_admin && (
                    <NavMain items={adminNavItems} label="Admin" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
