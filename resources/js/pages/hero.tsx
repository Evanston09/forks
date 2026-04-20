import { Head, Link, usePage } from '@inertiajs/react';
import { Scroll, ScrollControls, useScroll } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import Countdown from '@/components/countdown';
import HeroHeader from '@/components/hero-header';
import { Button } from '@/components/ui/button';
import MainScene from '@/scenes/main-scene';

const EYEBROW_TEXT_CLASS =
    'text-sm font-light tracking-wide text-zinc-300 uppercase';

function HeroTitle() {
    const ref = useRef<HTMLDivElement>(null!);
    const scroll = useScroll();

    useFrame(() => {
        const fade = 1 - scroll.range(0, 2 / 9);
        ref.current.style.opacity = String(fade);
    });

    return (
        <div
            ref={ref}
            className="pointer-events-none absolute top-0 flex h-screen w-full flex-col items-center justify-center"
        >
            <p className={EYEBROW_TEXT_CLASS}>NCSSM Morganton</p>
            <h1 className="mt-2 text-7xl leading-none font-bold tracking-tighter text-white uppercase sm:text-8xl md:text-[10rem]">
                FORKS
            </h1>
        </div>
    );
}

export default function Hero() {
    const { game } = usePage().props;

    return (
        <>
            <Head />
            <HeroHeader />

            <div className="relative h-screen w-screen">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ScrollControls pages={9} damping={0.1}>
                        <MainScene />
                        <Scroll html style={{ width: '100vw' }}>
                            <HeroTitle />

                            <div className="absolute top-[150vh] flex h-screen w-full items-center justify-center px-8">
                                <div className="text-center">
                                    <p className={EYEBROW_TEXT_CLASS}>
                                        One night, a fork will
                                    </p>
                                    <p className="text-4xl font-bold tracking-tight text-white uppercase sm:text-5xl md:text-7xl">
                                        slide under your door.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-[300vh] flex h-screen w-full items-center justify-center px-8">
                                <div className="text-center">
                                    <p className={EYEBROW_TEXT_CLASS}>
                                        On it —
                                    </p>
                                    <p className="text-4xl font-bold tracking-tight text-white uppercase sm:text-5xl md:text-7xl">
                                        someone else's name.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-[400vh] flex h-screen w-full flex-col items-center justify-center gap-2">
                                <p className={EYEBROW_TEXT_CLASS}>Welcome to</p>
                                <h1 className="text-8xl leading-none font-bold tracking-tighter text-white uppercase sm:text-9xl md:text-[14rem]">
                                    FORKS
                                </h1>
                                <p className={EYEBROW_TEXT_CLASS}>
                                    NCSSM Morganton
                                </p>
                            </div>

                            {/* Page 6: How it works */}
                            <div className="absolute top-[500vh] flex h-screen w-full items-center px-6 md:w-1/2 md:px-0 md:pl-16">
                                <div>
                                    <p className={EYEBROW_TEXT_CLASS}>
                                        The rules
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                                        How it works
                                    </h2>
                                    <ul className="mt-6 space-y-3 text-lg leading-relaxed text-zinc-300">
                                        <li>
                                            — You get a fork with another
                                            student's name — that's your target
                                        </li>
                                        <li>
                                            — Lightly tap your target on the
                                            shoulder with your fork to eliminate
                                            them
                                        </li>
                                        <li>
                                            — Inherit their fork and their
                                            target
                                        </li>
                                        <li>
                                            — Last one standing is crowned the
                                            2026 Forks Champion
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Page 7: Immunity & Safe Zones */}
                            <div className="absolute top-[600vh] flex h-screen w-full items-center px-6 md:w-1/2 md:px-0 md:pl-16">
                                <div>
                                    <p className={EYEBROW_TEXT_CLASS}>
                                        The rules
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                                        Immunity
                                    </h2>
                                    <ul className="mt-6 space-y-3 text-lg leading-relaxed text-zinc-300">
                                        <li>
                                            — Touch any fork to your nose to
                                            become immune
                                        </li>
                                        <li>
                                            — Hold it with your palm — no taping
                                            or sticking it to your nose
                                        </li>
                                        <li>
                                            — It doesn't have to be your
                                            assigned fork
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Page 8: Safe Zones */}
                            <div className="absolute top-[700vh] flex h-screen w-full items-center px-6 md:w-1/2 md:px-0 md:pl-16">
                                <div>
                                    <p className={EYEBROW_TEXT_CLASS}>
                                        The rules
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                                        Safe zones
                                    </h2>
                                    <ul className="mt-6 space-y-3 text-lg leading-relaxed text-zinc-300">
                                        <li>
                                            — Your own dorm, bathrooms, and
                                            showers
                                        </li>
                                        <li>
                                            — Classrooms during and 5 min
                                            before/after class
                                        </li>
                                        <li>
                                            — Cafeteria during meal hours,
                                            library, Fablab
                                        </li>
                                        <li>
                                            — SWAC while working out, music
                                            rooms while practicing
                                        </li>
                                        <li>
                                            — Clubs, sports, and forums during
                                            advertised hours
                                        </li>
                                        <li>— Everywhere off campus</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Page 9: CTA + Countdown */}
                            <div className="absolute top-[800vh] flex h-screen w-full flex-col items-center justify-center">
                                <Countdown target={new Date(game.start)} />
                                <Button asChild size="lg" className="mt-6">
                                    <Link href="/login">Log in</Link>
                                </Button>
                            </div>

                            <div className="absolute top-[895vh] flex w-full items-center justify-center">
                                <p className="text-center text-sm text-zinc-300">
                                    Built with {'<3'} by{' '}
                                    <a
                                        href="https://evankim.me"
                                        className="underline"
                                    >
                                        Evan Kim '27
                                    </a>
                                    <br />
                                    Models by Hoang Vu
                                </p>
                            </div>
                        </Scroll>
                    </ScrollControls>
                </Canvas>
            </div>
        </>
    );
}
