<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $game = Game::current();
        $googleUser = Socialite::driver('google')->user();

        $isAdmin = in_array($googleUser->getEmail(), config('game.admin_emails'));

        if (! $game->authIsOpen() && ! $isAdmin) {
            return to_route('login')->with('status', 'Logins are currently closed.');
        }

        if (! str_ends_with($googleUser->getEmail(), '@ncssm.edu')) {
            return to_route('login')->with('status', 'You must use an NCSSM email to log in.');
        }

        if (! $isAdmin && ! str_contains($googleUser->getEmail(), '26')) {
            return to_route('login')->with('status', 'Only class of 2026 students can sign up.');
        }

        $user = User::query()
            ->where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            $user->update([
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName() ?: $user->name,
                'email' => $googleUser->getEmail() ?: $user->email,
                'is_admin' => $isAdmin,
            ]);
        } else {
            $user = User::create([
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'is_admin' => $isAdmin,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
