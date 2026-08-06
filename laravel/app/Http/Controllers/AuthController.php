<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(Request $request): View|RedirectResponse
    {
        if ($request->session()->get('founder_authenticated') === true) {
            return redirect('/');
        }

        return view('login', [
            'showError' => $request->query('error') === 'wrong',
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $password = $request->input('password');
        $configuredPassword = config('founder.password');

        if (! $this->passwordMatches($password, $configuredPassword)) {
            Log::warning('auth.login_failed');

            return redirect('/login?error=wrong');
        }

        $request->session()->regenerate();
        $request->session()->put('founder_authenticated', true);

        Log::info('auth.login_success');

        return redirect('/');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Log::info('auth.logout');

        return redirect('/login');
    }

    private function passwordMatches(mixed $password, mixed $configuredPassword): bool
    {
        if (! is_string($password) || ! is_string($configuredPassword) || $configuredPassword === '') {
            return false;
        }

        return hash_equals(
            hash('sha256', $configuredPassword),
            hash('sha256', $password),
        );
    }
}
