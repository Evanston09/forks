import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { rules } from '@/routes';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account',
        href: edit().url,
    },
];

const DORM_LOCATIONS = [
    '1st South',
    '2nd South',
    '3rd South',
    '4th South',
    '2nd North',
    '3rd North',
    '4th North',
    '5th North',
] as const;

export default function Profile({
    isProfileComplete,
}: {
    isProfileComplete: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isProfileComplete ? 'Account' : 'Complete profile'} />

            <h1 className="sr-only">Account</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={
                            isProfileComplete
                                ? 'Profile details'
                                : 'Complete your profile'
                        }
                        description={
                            isProfileComplete
                                ? 'Update the details used in the game.'
                                : 'Add the details required before you can play.'
                        }
                    />

                    <Form
                        action={ProfileController.update().url}
                        method="patch"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Google account email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={auth.user.email}
                                        readOnly
                                        disabled
                                        className="bg-muted/60"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nickname">Nickname</Label>
                                    <Input
                                        id="nickname"
                                        name="nickname"
                                        defaultValue={String(
                                            auth.user.nickname ?? '',
                                        )}
                                        placeholder="What people call you"
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.nickname} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        defaultValue={String(
                                            auth.user.phone ?? '',
                                        )}
                                        placeholder="(555) 555-5555"
                                        autoComplete="tel"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_location">Dorm</Label>
                                    <Select
                                        name="dorm_location"
                                        defaultValue={String(
                                            auth.user.dorm_location ?? '',
                                        )}
                                    >
                                        <SelectTrigger id="dorm_location">
                                            <SelectValue placeholder="Select your dorm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DORM_LOCATIONS.map((dorm) => (
                                                <SelectItem
                                                    key={dorm}
                                                    value={dorm}
                                                >
                                                    {dorm}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.dorm_location}
                                    />
                                </div>

                                {!isProfileComplete && (
                                    <Alert>
                                        <BookOpen />
                                        <AlertTitle>
                                            Read the rules first
                                        </AlertTitle>
                                        <AlertDescription>
                                            Make sure you've read the{' '}
                                            <a
                                                href={rules().url}
                                                target="_blank"
                                            >
                                                full game rules
                                            </a>{' '}
                                            before joining.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        {isProfileComplete
                                            ? 'Save changes'
                                            : 'Complete setup'}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
