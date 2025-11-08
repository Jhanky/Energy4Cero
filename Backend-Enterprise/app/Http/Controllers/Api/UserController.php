<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar usuarios con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = User::with('role');

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('department', 'like', "%{$search}%")
                      ->orWhere('position', 'like', "%{$search}%");
                });
            }

            if ($request->filled('role_id')) {
                $query->where('role_id', $request->role_id);
            }

            if ($request->filled('department')) {
                $query->where('department', $request->department);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
                'by_role' => User::with('role')->get()->groupBy('role.name')->map->count(),
                'by_department' => User::all()->groupBy('department')->map->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users->items(),
                    'pagination' => [
                        'current_page' => $users->currentPage(),
                        'per_page' => $users->perPage(),
                        'total' => $users->total(),
                        'last_page' => $users->lastPage(),
                        'from' => $users->firstItem(),
                        'to' => $users->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Usuarios obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un usuario específico
     */
    public function show($id)
    {
        try {
            $user = User::with('role')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ],
                'message' => 'Usuario obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email|ends_with:@energy4cero.com',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|max:20',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'role_id' => 'required|exists:roles,role_id',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'email.ends_with' => 'Solo se permiten emails con dominio @energy4cero.com',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
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

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'department' => $request->department,
                'position' => $request->position,
                'role_id' => $request->role_id,
                'is_active' => $request->get('is_active', true),
            ]);

            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ],
                'message' => 'Usuario creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un usuario existente
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('users')->ignore($user->id),
                    'ends_with:@energy4cero.com'
                ],
                'password' => 'nullable|string|min:6',
                'phone' => 'nullable|string|max:20',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'role_id' => 'sometimes|required|exists:roles,role_id',
                'is_active' => 'sometimes|boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'email.ends_with' => 'Solo se permiten emails con dominio @energy4cero.com',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
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

            $updateData = $request->only(['name', 'email', 'phone', 'department', 'position', 'role_id', 'is_active']);
            
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);
            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ],
                'message' => 'Usuario actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // No permitir eliminar el usuario administrador principal
            if ($user->email === 'admin@energy4cero.com') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el usuario administrador principal'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un usuario
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // No permitir desactivar el usuario administrador principal
            if ($user->email === 'admin@energy4cero.com') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede desactivar el usuario administrador principal'
                ], 403);
            }

            $user->is_active = !$user->is_active;
            $user->save();
            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ],
                'message' => $user->is_active ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'users_by_role' => User::with('role')
                    ->get()
                    ->groupBy('role.name')
                    ->map->count(),
                'users_by_department' => User::all()
                    ->groupBy('department')
                    ->map->count(),
                'recent_users' => User::where('created_at', '>=', now()->subDays(30))->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $stats
                ],
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener opciones para formularios (roles, departamentos, etc.)
     */
    public function options()
    {
        try {
            $options = [
                'roles' => Role::where('is_active', true)
                    ->select('id', 'name', 'slug')
                    ->orderBy('name')
                    ->get(),
                'departments' => User::select('department')
                    ->whereNotNull('department')
                    ->where('department', '!=', '')
                    ->distinct()
                    ->orderBy('department')
                    ->pluck('department'),
                'positions' => User::select('position')
                    ->whereNotNull('position')
                    ->where('position', '!=', '')
                    ->distinct()
                    ->orderBy('position')
                    ->pluck('position'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'options' => $options
                ],
                'message' => 'Opciones obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener opciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}