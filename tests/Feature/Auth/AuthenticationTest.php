<?php

use App\Enums\GameStage;
use App\Models\Game;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Facades\Socialite;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('game.stage', GameStage::Pregame->value)
        );
});

test('login screen reflects the current game stage', function () {
    Game::current()->update(['stage' => GameStage::Running]);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('game.stage', GameStage::Running->value)
        );
});

test('login screen links guests into the google auth flow', function () {
    expect(Route::has('auth.google'))->toBeTrue();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('hero'));
});

test('new users cannot create accounts through google when public signup is closed', function () {
    Game::current()->update([
        'stage' => GameStage::Running,
        'public_signup_open' => false,
    ]);

    $googleUser = new class
    {
        public function getId(): string
        {
            return 'google-123';
        }

        public function getName(): string
        {
            return 'Some User';
        }

        public function getEmail(): string
        {
            return 'someone26@ncssm.edu';
        }
    };

    Socialite::shouldReceive('driver->user')->once()->andReturn($googleUser);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('status', 'Public signup is currently closed.');

    $this->assertGuest();
});

test('existing users can sign in through google when public signup is closed', function () {
    Game::current()->update([
        'stage' => GameStage::Running,
        'public_signup_open' => false,
        'seniors_only_signup' => true,
    ]);

    $user = User::factory()->create([
        'google_id' => 'existing-google-id',
        'email' => 'existing27d@ncssm.edu',
        'profile_completed' => true,
    ]);

    $googleUser = new class
    {
        public function getId(): string
        {
            return 'existing-google-id';
        }

        public function getName(): string
        {
            return 'Existing User';
        }

        public function getEmail(): string
        {
            return 'existing27d@ncssm.edu';
        }
    };

    Socialite::shouldReceive('driver->user')->once()->andReturn($googleUser);

    $this->get(route('auth.google.callback'))
        ->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user->refresh());
});

test('non seniors with ncssm emails cannot create accounts when seniors only signup is enabled', function () {
    Game::current()->update([
        'stage' => GameStage::Running,
        'public_signup_open' => true,
        'seniors_only_signup' => true,
    ]);

    $googleUser = new class
    {
        public function getId(): string
        {
            return 'google-456';
        }

        public function getName(): string
        {
            return 'Junior User';
        }

        public function getEmail(): string
        {
            return 'student27@ncssm.edu';
        }
    };

    Socialite::shouldReceive('driver->user')->once()->andReturn($googleUser);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('status', 'Only class of 2026 students can sign up.');

    $this->assertGuest();
});

test('any ncssm email can create an account when seniors only signup is disabled', function () {
    Game::current()->update([
        'stage' => GameStage::Running,
        'public_signup_open' => true,
        'seniors_only_signup' => false,
    ]);

    $googleUser = new class
    {
        public function getId(): string
        {
            return 'google-789';
        }

        public function getName(): string
        {
            return 'Junior User';
        }

        public function getEmail(): string
        {
            return 'student27@ncssm.edu';
        }
    };

    Socialite::shouldReceive('driver->user')->once()->andReturn($googleUser);

    $this->get(route('auth.google.callback'))
        ->assertRedirect('/dashboard');

    $user = User::query()->where('google_id', 'google-789')->first();

    expect($user)->not()->toBeNull();
    expect($user?->email)->toBe('student27@ncssm.edu');

    $this->assertAuthenticatedAs($user);
});
