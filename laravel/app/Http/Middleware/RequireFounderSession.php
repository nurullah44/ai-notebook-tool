<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireFounderSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get('founder_authenticated') !== true) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Not authenticated.'], 401);
            }

            return redirect('/login');
        }

        return $next($request);
    }
}
