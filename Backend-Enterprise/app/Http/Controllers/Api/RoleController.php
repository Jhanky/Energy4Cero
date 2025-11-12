<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Listar roles con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Role::query()->withCount('users');

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
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
            $roles = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Role::count(),
                'active' => Role::where('is_active', true)->count(),
                'inactive' => Role::where('is_active', false)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'roles' => $roles->items(),
                    'pagination' => [
                        'current_page' => $roles->currentPage(),
                        'per_page' => $roles->perPage(),
                        'total' => $roles->total(),
                        'last_page' => $roles->lastPage(),
                        'from' => $roles->firstItem(),
                        'to' => $roles->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Roles obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un rol específico
     */
    public function show($id)
    {
        try {
            $role = Role::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role
                ],
                'message' => 'Rol obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo rol
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name',
                'slug' => 'required|string|max:255|unique:roles,slug|regex:/^[a-z0-9\-]+$/',
                'description' => 'nullable|string|max:500',
                'permissions' => 'required|array',
                'permissions.*' => 'string',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe un rol con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe un rol con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones',
                'permissions.required' => 'Los permisos son obligatorios',
                'permissions.array' => 'Los permisos deben ser un array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $role = Role::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'permissions' => $request->permissions,
                'is_active' => $request->get('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role
                ],
                'message' => 'Rol creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un rol existente
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->role_id . ',role_id',
                'slug' => 'sometimes|required|string|max:255|unique:roles,slug,' . $role->role_id . ',role_id|regex:/^[a-z0-9\-]+$/',
                'description' => 'nullable|string|max:500',
                'permissions' => 'sometimes|required|array',
                'permissions.*' => 'string',
                'is_active' => 'sometimes|boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe un rol con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe un rol con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones',
                'permissions.required' => 'Los permisos son obligatorios',
                'permissions.array' => 'Los permisos deben ser un array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['name', 'slug', 'description', 'permissions', 'is_active']);
            $role->update($updateData);

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role
                ],
                'message' => 'Rol actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un rol
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            
            // Verificar si hay usuarios usando este rol
            $usersCount = $role->users()->count();
            if ($usersCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el rol porque tiene {$usersCount} usuario(s) asignado(s)"
                ], 403);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rol eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un rol
     */
    public function toggleStatus($id)
    {
        try {
            $role = Role::findOrFail($id);
            $role->is_active = !$role->is_active;
            $role->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role
                ],
                'message' => $role->is_active ? 'Rol activado exitosamente' : 'Rol desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de roles
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_roles' => Role::count(),
                'active_roles' => Role::where('is_active', true)->count(),
                'inactive_roles' => Role::where('is_active', false)->count(),
                'users_by_role' => Role::withCount('users')->get()->mapWithKeys(function($role) {
                    return [$role->name => $role->users_count];
                }),
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
     * Obtener permisos disponibles
     */
    public function permissions()
    {
        try {
            // Obtener permisos desde la configuración
            $permissionsConfig = config('permissions') ?: $this->getDefaultPermissionsConfig();

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $permissionsConfig
                ],
                'message' => 'Permisos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener permisos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Configuración por defecto de permisos
     */
    private function getDefaultPermissionsConfig()
    {
        return [
            'users' => [
                'create' => 'users.create',
                'read' => 'users.read',
                'update' => 'users.update',
                'delete' => 'users.delete',
            ],
            'roles' => [
                'create' => 'roles.create',
                'read' => 'roles.read',
                'update' => 'roles.update',
                'delete' => 'roles.delete',
            ],
            'projects' => [
                'create' => 'projects.create',
                'read' => 'projects.read',
                'update' => 'projects.update',
                'delete' => 'projects.delete',
            ],
            'tasks' => [
                'create' => 'tasks.create',
                'read' => 'tasks.read',
                'update' => 'tasks.update',
                'delete' => 'tasks.delete',
            ],
            'inventory' => [
                'create' => 'inventory.create',
                'read' => 'inventory.read',
                'update' => 'inventory.update',
                'delete' => 'inventory.delete',
            ],
            'support' => [
                'create' => 'support.create',
                'read' => 'support.read',
                'update' => 'support.update',
                'delete' => 'support.delete',
            ],
            'financial' => [
                'read' => 'financial.read',
                'update' => 'financial.update',
                'reports' => 'financial.reports',
            ],
            'commercial' => [
                'read' => 'commercial.read',
                'update' => 'commercial.update',
                'reports' => 'commercial.reports',
            ],
            'settings' => [
                'read' => 'settings.read',
                'update' => 'settings.update',
            ],
            'reports' => [
                'create' => 'reports.create',
                'read' => 'reports.read',
                'update' => 'reports.update',
                'delete' => 'reports.delete',
            ],
        ];
    }
}
