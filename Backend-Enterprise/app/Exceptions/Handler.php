<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (Throwable $e, Request $request) {
            // Solo manejar respuestas JSON para API
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Manejar excepciones para respuestas API JSON
     */
    protected function handleApiException(Throwable $e, Request $request)
    {
        // Autenticación fallida
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Debes iniciar sesión.',
                'error' => 'UNAUTHENTICATED',
                'code' => 401
            ], 401);
        }

        // Autorización fallida
        if ($e instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción.',
                'error' => 'FORBIDDEN',
                'code' => 403
            ], 403);
        }

        // Validación fallida
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Los datos proporcionados no son válidos.',
                'error' => 'VALIDATION_ERROR',
                'errors' => $e->errors(),
                'code' => 422
            ], 422);
        }

        // Modelo no encontrado
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'El recurso solicitado no fue encontrado.',
                'error' => 'NOT_FOUND',
                'code' => 404
            ], 404);
        }

        // Ruta no encontrada
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'La ruta solicitada no existe.',
                'error' => 'ROUTE_NOT_FOUND',
                'code' => 404
            ], 404);
        }

        // Método HTTP no permitido
        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Método HTTP no permitido para esta ruta.',
                'error' => 'METHOD_NOT_ALLOWED',
                'code' => 405
            ], 405);
        }

        // Otras excepciones HTTP
        if ($e instanceof HttpException) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Error HTTP',
                'error' => 'HTTP_ERROR',
                'code' => $e->getStatusCode()
            ], $e->getStatusCode());
        }

        // Error interno del servidor (500)
        return response()->json([
            'success' => false,
            'message' => config('app.debug') ? $e->getMessage() : 'Ha ocurrido un error interno del servidor.',
            'error' => 'INTERNAL_SERVER_ERROR',
            'code' => 500,
            'trace' => config('app.debug') ? $e->getTraceAsString() : null
        ], 500);
    }
}
