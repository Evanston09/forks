<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create([
        'profile_completed' => true,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('admin game page receives admin only game settings props', function () {
    $user = User::factory()->create([
        'is_admin' => true,
        'profile_completed' => true,
    ]);

    \App\Models\Game::current()->update([
        'auth_open' => true,
        'seniors_only_signup' => false,
        'show_real_names' => true,
    ]);

    $this->actingAs($user)
        ->get(route('game'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/game')
            ->where('game.auth_open', true)
            ->where('game.seniors_only_signup', false)
            ->where('game.show_real_names', true)
        );
});
