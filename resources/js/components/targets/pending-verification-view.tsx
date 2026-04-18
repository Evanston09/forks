import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { approve, contest } from '@/actions/App/Http/Controllers/KillController';
import { ClaimMeta, StateCard } from '@/components/targets/shared';
import type { KillClaim } from '@/components/targets/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PendingVerificationView({
    claim,
}: {
    claim: KillClaim;
}) {
    const killerName = claim.killer?.name ?? 'Unknown';
    const [showContestForm, setShowContestForm] = useState(false);

    return (
        <StateCard
            title="Kill Claim Pending Verification"
            description={`Review ${killerName}'s claim before the deadline.`}
        >
            <div className="flex flex-col gap-4">
                <ClaimMeta claim={claim} />
                {showContestForm ? (
                    <Form
                        {...contest.form()}
                        resetOnSuccess
                        onSuccess={() => setShowContestForm(false)}
                    >
                        {({ errors, processing }) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="contest_reason">
                                    Why is this claim invalid?
                                </Label>
                                <Textarea
                                    id="contest_reason"
                                    name="contest_reason"
                                    rows={4}
                                    placeholder="Describe what happened..."
                                />
                                <InputError message={errors.contest_reason} />
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Submit Contest
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowContestForm(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                ) : (
                    <div className="flex gap-2">
                        <Form {...approve.form()}>
                            <Button type="submit">Approve Claim</Button>
                        </Form>
                        <Button
                            variant="destructive"
                            onClick={() => setShowContestForm(true)}
                        >
                            Contest Claim
                        </Button>
                    </div>
                )}
            </div>
        </StateCard>
    );
}
