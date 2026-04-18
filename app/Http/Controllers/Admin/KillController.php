<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\KillClaimResolution;
use App\Models\Kill;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KillController extends Controller
{
    public function index(): Response
    {
        $kills = Kill::with([
            'killer:id,name',
            'victim:id,name',
        ])->latest()->get();

        return Inertia::render('admin/kills', [
            'kills' => $kills,
        ]);
    }

    public function approve(Kill $kill, KillClaimResolution $resolution): RedirectResponse
    {
        if (! $resolution->approve($kill, 'admin')) {
            return back()->withErrors(['kill' => 'That kill claim could not be approved.']);
        }

        return back();
    }

    public function deny(Kill $kill, KillClaimResolution $resolution): RedirectResponse
    {
        if (! $resolution->deny($kill, 'admin')) {
            return back()->withErrors(['kill' => 'That kill claim could not be denied.']);
        }

        return back();
    }
}
