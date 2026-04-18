<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'isProfileComplete' => $request->user()->profile_completed,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nickname' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:20'],
            'dorm_location' => ['required', 'string', Rule::in(['1st South', '2nd South', '3rd South', '4th South', '2nd North', '3rd North', '4th North', '5th North'])],
        ]);

        $user = $request->user();
        $wasProfileComplete = $user->profile_completed;

        $user->update([
            ...$validated,
            'profile_completed' => true,
        ]);

        if (! $wasProfileComplete) {
            return to_route('dashboard');
        }

        return to_route('profile.edit');
    }
}
