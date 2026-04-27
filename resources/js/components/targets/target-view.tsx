import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { store as killStore } from '@/actions/App/Http/Controllers/KillController';
import InputError from '@/components/input-error';
import type {
    PlayerOption,
    Target,
    TargetPagePlayer,
} from '@/components/targets/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function TargetView({
    target,
    players,
}: {
    target: Target | null;
    players: TargetPagePlayer[];
}) {
    const playerOptions: PlayerOption[] = players.map((player) => ({
        id: player.id,
        name: player.name,
    }));
    const [verificationTarget, setVerificationTarget] =
        useState<PlayerOption | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const targetName = target?.name ?? 'No target assigned';

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

    useEffect(() => {
        if (!showCelebration) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setShowCelebration(false);
        }, 10000);

        return () => window.clearTimeout(timeoutId);
    }, [showCelebration]);

    return (
        <>
            {showCelebration &&
                viewportSize.width > 0 &&
                viewportSize.height > 0 && (
                    <Confetti
                        width={viewportSize.width}
                        height={viewportSize.height}
                    />
                )}
            <Card className="relative w-full max-w-md">
                <CardHeader className="text-center">
                    <CardDescription>Your Target</CardDescription>
                    <CardTitle
                        className={cn(
                            'cursor-pointer text-2xl transition duration-150',
                            !isVisible && target && 'blur-xl select-none',
                        )}
                        onMouseEnter={() => setIsVisible(true)}
                        onMouseLeave={() => setIsVisible(false)}
                        onClick={() => setIsVisible((value) => !value)}
                    >
                        {targetName}
                    </CardTitle>
                    <CardDescription>
                        {target
                            ? isVisible
                                ? 'Move away to hide'
                                : 'Hover or tap to reveal'
                            : 'Targets will appear here when assigned.'}
                    </CardDescription>
                </CardHeader>
                {target ? (
                    <CardContent>
                        {showCelebration ? (
                            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                    Kill claim submitted.
                                </p>
                            </div>
                        ) : null}
                        <Form
                            {...killStore.form()}
                            resetOnSuccess
                            onSuccess={() => {
                                setVerificationTarget(null);
                                setShowCelebration(true);
                            }}
                            className="flex flex-col gap-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="verification_id">
                                            Your target&apos;s next
                                            target&apos;s player
                                        </Label>
                                        <Combobox
                                            name="verification_id"
                                            value={verificationTarget}
                                            onValueChange={
                                                setVerificationTarget
                                            }
                                            items={playerOptions}
                                            itemToStringLabel={(
                                                player: PlayerOption,
                                            ) => player.name}
                                            itemToStringValue={(
                                                player: PlayerOption,
                                            ) => String(player.id)}
                                        >
                                            <ComboboxInput
                                                id="verification_id"
                                                placeholder="Search players..."
                                                className="w-full"
                                                showClear
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>
                                                    No players found.
                                                </ComboboxEmpty>
                                                <ComboboxList>
                                                    {(player) => (
                                                        <ComboboxItem
                                                            key={player.id}
                                                            value={player}
                                                        >
                                                            {player.name}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        <InputError
                                            message={errors.verification_id}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !verificationTarget || processing
                                        }
                                    >
                                        Submit Kill Claim
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                ) : null}
            </Card>
        </>
    );
}
