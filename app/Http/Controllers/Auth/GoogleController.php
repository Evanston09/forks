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
        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();

        $isAdmin = in_array($email, config('game.admin_emails'));

        if (! str_ends_with($email, '@ncssm.edu')) {
            return to_route('login')->with('status', 'You must use an NCSSM email to log in.');
        }

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if ($user) {
            $user->update([
                'google_id' => $googleId,
                'name' => $googleUser->getName() ?: $user->name,
                'email' => $email ?: $user->email,
                'is_admin' => $isAdmin,
            ]);
        } else {
            if (! $game->public_signup_open && ! $isAdmin) {
                return to_route('login')->with('status', 'Public signup is currently closed.');
            }

            if ($game->seniors_only_signup && ! $isAdmin && ! str_contains($email, '26')) {
                return to_route('login')->with('status', 'Only class of 2026 students can sign up.');
            }

            $user = User::create([
                'google_id' => $googleId,
                'name' => $googleUser->getName(),
                'email' => $email,
                'is_admin' => $isAdmin,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
