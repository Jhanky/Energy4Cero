<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('🔐 MIDDLEWARE ApiTokenAuth: Iniciando validación', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'has_bearer' => !empty($request->bearerToken()),
            'has_query_token' => !empty($request->query('token'))
        ]);

        // Intentar obtener token desde Authorization header
        $token = $request->bearerToken();

        // Si no hay token en header, intentar desde query parameter
        if (!$token) {
            $token = $request->query('token');
            \Log::info('🔑 Token obtenido desde query parameter');
        } else {
            \Log::info('🔑 Token obtenido desde Authorization header');
        }

        if (!$token) {
            \Log::error('❌ No se encontró token de autenticación');
            return response()->json([
                'success' => false,
                'message' => 'Token de autenticación requerido'
            ], 401);
        }

        \Log::info('🔍 Buscando token en base de datos...');
        // Verificar el token usando Sanctum - buscar por el token hasheado
        $accessToken = \Laravel\Sanctum\PersonalAccessToken::where('token', hash('sha256', $token))->first();

        if (!$accessToken || !$accessToken->tokenable) {
            \Log::error('❌ Token no encontrado o inválido', [
                'token_hash' => hash('sha256', $token),
                'found_token' => $accessToken ? 'Sí' : 'No',
                'has_tokenable' => $accessToken && $accessToken->tokenable ? 'Sí' : 'No'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Token inválido o expirado'
            ], 401);
        }

        // Verificar si el token no ha expirado
        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
            \Log::error('❌ Token expirado', [
                'expires_at' => $accessToken->expires_at,
                'now' => now()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Token expirado'
            ], 401);
        }

        \Log::info('✅ Token válido, autenticando usuario', [
            'user_id' => $accessToken->tokenable->id,
            'user_name' => $accessToken->tokenable->name
        ]);

        // Autenticar al usuario para esta request
        Auth::login($accessToken->tokenable);

        return $next($request);
    }
}
