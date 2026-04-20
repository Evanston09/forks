import { Head } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';
import googleSignIn from '@/assets/sign_in_google.svg';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/auth-layout';

export default function Login({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Use your Google account to continue"
        >
            <Head title="Log in" />
            {status ? (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            ) : null}
            <a href="/auth/google" className="flex justify-center">
                <img
                    src={googleSignIn}
                    alt="Sign in with Google"
                    height={40}
                />
            </a>
        </AuthLayout>
    );
}
