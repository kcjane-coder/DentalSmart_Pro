<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    public function create(): View
    {
        return view('auth.login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        switch ($user->role) {

            case 'admin':
                return redirect()->route('admin.dashboard');

            case 'staff':
                return redirect()->route('staff.dashboard');

            case 'dentist':
                return redirect()->route('dentist.dashboard');

            case 'patient':
                return redirect()->route('patient.dashboard');

            default:
                Auth::logout();

                return redirect()->route('login')
                    ->withErrors([
                        'email' => 'Invalid account role.',
                    ]);
        }
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}