<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        try {
            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|ends_with:@energy4cero.com',
                'password' => 'required|string|min:6',
            ], [
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.ends_with' => 'Solo se permiten usuarios con dominio @energy4cero.com',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar usuario por email
            $user = User::where('email', $request->email)
                       ->where('is_active', true)
                       ->with('role')
                       ->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            // Crear token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'department' => $user->department,
                        'position' => $user->position,
                        'is_active' => $user->is_active,
                        'role' => $user->role ? [
                            'id' => $user->role->role_id,
                            'name' => $user->role->name,
                            'slug' => $user->role->slug,
                            'description' => $user->role->description,
                            'permissions' => $user->role->permissions,
                            'is_active' => $user->role->is_active,
                        ] : null,
                        'permissions' => $user->getAllPermissions(),
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        try {
            // Revocar el token actual
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener usuario actual
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user()->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Usuario obtenido exitosamente',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'department' => $user->department,
                        'position' => $user->position,
                        'is_active' => $user->is_active,
                        'role' => $user->role ? [
                            'id' => $user->role->role_id,
                            'name' => $user->role->name,
                            'slug' => $user->role->slug,
                            'description' => $user->role->description,
                            'permissions' => $user->role->permissions,
                            'is_active' => $user->role->is_active,
                        ] : null,
                        'permissions' => $user->getAllPermissions(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar token
     */
    public function verify(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido o expirado'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token válido',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'is_active' => $user->is_active,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar nuevo usuario (solo para administradores)
     */
    public function register(Request $request)
    {
        try {
            // Verificar permisos
            if (!$request->user()->hasPermission('users.create')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear usuarios'
                ], 403);
            }

            // Validar datos
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
                'phone' => 'nullable|string|max:20',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'role_id' => 'required|exists:roles,role_id',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'El email ya está registrado',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'role_id.required' => 'El rol es obligatorio',
                'role_id.exists' => 'El rol seleccionado no existe',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'department' => $request->department,
                'position' => $request->position,
                'role_id' => $request->role_id,
                'is_active' => true,
            ]);

            // Cargar relación con rol
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'department' => $user->department,
                        'position' => $user->position,
                        'is_active' => $user->is_active,
                        'role' => $user->role ? [
                            'id' => $user->role->role_id,
                            'name' => $user->role->name,
                            'slug' => $user->role->slug,
                            'description' => $user->role->description,
                            'permissions' => $user->role->permissions,
                            'is_active' => $user->role->is_active,
                        ] : null,
                        'permissions' => $user->getAllPermissions(),
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}