<?php

namespace App\Http\Controllers\Admin;

use App\Enums\GameStage;
use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class GameController extends Controller
{
    public function rules(): BinaryFileResponse
    {
        $game = Game::current();
        $publicDisk = Storage::disk('public');
        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        if (filled($game->rules_pdf_path) && $publicDisk->exists($game->rules_pdf_path)) {
            return response()->file(
                $publicDisk->path($game->rules_pdf_path),
                $headers,
            );
        }

        $fallbackPath = public_path('forks-game-rules.pdf');

        return response()->file($fallbackPath, $headers);
    }

    public function index(): Response
    {
        $game = Game::current();
        $total = User::query()->where('is_admin', false)->count();
        $alive = User::query()->where('is_admin', false)->where('alive', true)->count();

        return Inertia::render('admin/game', [
            'game' => [
                'stage' => $game->stage->value,
                'public_signup_open' => $game->public_signup_open,
                'seniors_only_signup' => $game->seniors_only_signup,
                'ffa' => $game->ffa,
                'show_real_names' => $game->show_real_names,
                'rules_pdf_uploaded' => filled($game->rules_pdf_path),
                'start' => config('game.start'),
            ],
            'stats' => [
                'total' => $total,
                'alive' => $alive,
                'dead' => $total - $alive,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => ['sometimes', Rule::enum(GameStage::class)],
            'public_signup_open' => ['sometimes', 'boolean'],
            'seniors_only_signup' => ['sometimes', 'boolean'],
            'show_real_names' => ['sometimes', 'boolean'],
        ]);

        Game::current()->update($validated);

        return to_route('game');
    }

    public function updateRulesPdf(Request $request): RedirectResponse
    {
        $game = Game::current();
        $validated = $request->validate([
            'rules_pdf' => [
                'required',
                File::types(['pdf'])->max(10 * 1024),
            ],
        ], attributes: [
            'rules_pdf' => 'rules PDF',
        ]);

        /** @var UploadedFile $rulesPdf */
        $rulesPdf = $validated['rules_pdf'];
        $path = $rulesPdf->store('rules', 'public');

        if (filled($game->rules_pdf_path) && Storage::disk('public')->exists($game->rules_pdf_path)) {
            Storage::disk('public')->delete($game->rules_pdf_path);
        }

        $game->update(['rules_pdf_path' => $path]);

        return to_route('game');
    }

    public function enableFfa(): RedirectResponse
    {
        $game = Game::current();

        if (! $game->ffa) {
            $game->update(['ffa' => true]);
        }

        return back();
    }
}
