import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, leaderboard, rules } from '@/routes';

export default function HeroHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <header className="fixed top-0 z-50 flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <Link href="/" className="flex items-center gap-2 text-white">
                <AppLogo />
            </Link>
            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 sm:flex">
                    <Button variant="link" size="sm" asChild>
                        <Link
                            href={leaderboard().url}
                            className="text-white hover:text-white"
                        >
                            Leaderboard
                        </Link>
                    </Button>
                    <Button variant="link" size="sm" asChild>
                        <a
                            href={rules().url}
                            target="_blank"
                            className="text-white hover:text-white"
                        >
                            Rules
                        </a>
                    </Button>
                    {auth.user && (
                        <Button variant="link" size="sm" asChild>
                            <Link
                                href={dashboard().url}
                                className="text-white hover:text-white"
                            >
                                Dashboard
                            </Link>
                        </Button>
                    )}
                </div>

                {auth.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="size-10 rounded-full p-1"
                            >
                                <Avatar className="size-8 overflow-hidden rounded-full">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="rounded-lg bg-zinc-700 text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button size="sm" asChild>
                        <Link href="/login">Log in</Link>
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="sm:hidden"
                >
                    <a href={rules().url} target="_blank" rel="noreferrer">
                        Rules
                    </a>
                </Button>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white sm:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-64 border-zinc-800 bg-zinc-950"
                    >
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        <SheetHeader className="text-left">
                            <AppLogo />
                        </SheetHeader>
                        <nav className="mt-8 flex flex-col gap-4 px-4">
                            <Link
                                href={leaderboard().url}
                                className="text-lg text-zinc-200"
                            >
                                Leaderboard
                            </Link>
                            <a
                                href={rules().url}
                                target="_blank"
                                className="text-lg text-zinc-200"
                            >
                                Rules
                            </a>
                            {auth.user ? (
                                <Link
                                    href={dashboard().url}
                                    className="text-lg text-zinc-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-lg text-zinc-200"
                                >
                                    Log in
                                </Link>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
