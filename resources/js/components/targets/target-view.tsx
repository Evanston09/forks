import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { store as killStore } from '@/actions/App/Http/Controllers/KillController';
import type { Target } from '@/components/targets/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function TargetView({ target }: { target: Target | null }) {
    const [verificationName, setVerificationName] = useState('');
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
                                setVerificationName('');
                                setShowCelebration(true);
                            }}
                            className="flex flex-col gap-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="verification_name">
                                            Your target&apos;s next
                                            target&apos;s full name
                                        </Label>
                                        <Input
                                            id="verification_name"
                                            name="verification_name"
                                            value={verificationName}
                                            onChange={(event) =>
                                                setVerificationName(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Enter full name to verify"
                                        />
                                        <InputError
                                            message={errors.verification_name}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !verificationName.trim() ||
                                            processing
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
