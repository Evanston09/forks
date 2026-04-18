import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { store as killStore } from '@/actions/App/Http/Controllers/KillController';
import type { AlivePlayer } from '@/components/targets/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function FfaTargetView({
    alivePlayers,
}: {
    alivePlayers: AlivePlayer[];
}) {
    const [victimId, setVictimId] = useState<string>('');
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
                            setVictimId('');
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
                                    <Select
                                        name="victim_id"
                                        value={victimId}
                                        onValueChange={setVictimId}
                                    >
                                        <SelectTrigger id="victim_id">
                                            <SelectValue placeholder="Select a player..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {alivePlayers.map((player) => (
                                                <SelectItem
                                                    key={player.id}
                                                    value={String(player.id)}
                                                >
                                                    {player.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.victim_id} />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!victimId || processing}
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
