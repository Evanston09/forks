import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { store as killStore } from '@/actions/App/Http/Controllers/KillController';
import InputError from '@/components/input-error';
import type {
    PlayerOption,
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

export default function FfaTargetView({
    players,
}: {
    players: TargetPagePlayer[];
}) {
    const playerOptions: PlayerOption[] = players.map((player) => ({
        id: player.id,
        name: player.name,
    }));
    const [victim, setVictim] = useState<PlayerOption | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardDescription>Free For All</CardDescription>
                    <CardTitle className="text-2xl">
                        Select Your Target
                    </CardTitle>
                </CardHeader>
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
                            setVictim(null);
                            setShowCelebration(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="victim_id">
                                        Choose a player to challenge
                                    </Label>
                                    <Combobox
                                        name="victim_id"
                                        value={victim}
                                        onValueChange={setVictim}
                                        items={playerOptions}
                                        itemToStringLabel={(
                                            player: PlayerOption,
                                        ) => player.name}
                                        itemToStringValue={(
                                            player: PlayerOption,
                                        ) => String(player.id)}
                                    >
                                        <ComboboxInput
                                            placeholder="Search players..."
                                            className="w-full"
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>
                                                No players found.
                                            </ComboboxEmpty>
                                            <ComboboxList>
                                                {(option) => (
                                                    <ComboboxItem
                                                        key={option.id}
                                                        value={option}
                                                    >
                                                        <span className="truncate">
                                                            {option.name}
                                                        </span>
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError message={errors.victim_id} />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!victim || processing}
                                >
                                    Submit Kill Claim
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}
