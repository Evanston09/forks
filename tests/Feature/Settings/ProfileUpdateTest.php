<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('profile page is displayed', function () {
    $user = User::factory()->create([
        'profile_completed' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('isProfileComplete', true)
        );
});

test('incomplete users are redirected to the unified profile page', function () {
    $user = User::factory()->create([
        'profile_completed' => false,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('profile.edit'));
});

test('incomplete users can complete their profile', function () {
    $user = User::factory()->create([
        'profile_completed' => false,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'nickname' => 'Night Owl',
            'phone' => '(555) 555-5555',
            'dorm_location' => '3rd North',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('dashboard'));

    $user->refresh();

    expect($user->nickname)->toBe('Night Owl');
    expect($user->phone)->toBe('(555) 555-5555');
    expect($user->dorm_location)->toBe('3rd North');
    expect($user->profile_completed)->toBeTrue();
});

test('completed users can update their profile information', function () {
    $user = User::factory()->create([
        'nickname' => 'Original',
        'phone' => '(111) 111-1111',
        'dorm_location' => '2nd South',
        'profile_completed' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'nickname' => 'Updated Nickname',
            'phone' => '(222) 222-2222',
            'dorm_location' => '4th North',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->nickname)->toBe('Updated Nickname');
    expect($user->phone)->toBe('(222) 222-2222');
    expect($user->dorm_location)->toBe('4th North');
});

test('profile update requires the remaining game fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), []);

    $response
        ->assertSessionHasErrors([
            'nickname',
            'phone',
            'dorm_location',
        ])
        ->assertRedirect(route('profile.edit'));
});
