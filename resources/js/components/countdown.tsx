import { useEffect, useState } from 'react';

interface CountdownProps {
    target: Date;
    label?: string;
}

export default function Countdown({
    target,
    label = 'Forks begin in',
}: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(target));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(target));
        }, 1000);
        return () => clearInterval(interval);
    }, [target]);

    if (timeLeft.total <= 0) {
        return (
            <div className="text-center">
                <p className="text-sm font-light tracking-wide text-zinc-300 uppercase">
                    The game is
                </p>
                <p className="mt-2 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-8xl">
                    LIVE
                </p>
            </div>
        );
    }

    return (
        <div className="text-center">
            <p className="text-xl font-light tracking-wide text-zinc-300 uppercase">
                {label}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
                <TimeUnit value={timeLeft.days} label="Days" />
                <Separator />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <Separator />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <Separator />
                <TimeUnit value={timeLeft.seconds} label="Sec" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white tabular-nums sm:text-5xl md:text-7xl">
                {String(value).padStart(2, '0')}
            </span>
            <span className="mt-2 text-sm font-light tracking-wide text-zinc-300 uppercase">
                {label}
            </span>
        </div>
    );
}

function Separator() {
    return (
        <span className="text-3xl font-light text-zinc-600 sm:text-4xl md:text-5xl">
            :
        </span>
    );
}

function getTimeLeft(target: Date) {
    const diff = target.getTime() - Date.now();
    if (diff <= 0)
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        total: diff,
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
    };
}
