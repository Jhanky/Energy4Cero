<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermissionController extends Controller
{
    /**
     * Listar permisos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Permission::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->search($search);
            }

            if ($request->filled('module')) {
                $query->where('module', $request->module);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'module');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $permissions = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Permission::count(),
                'active' => Permission::where('is_active', true)->count(),
                'inactive' => Permission::where('is_active', false)->count(),
                'modules' => Permission::getModules(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $permissions->items(),
                    'pagination' => [
                        'current_page' => $permissions->currentPage(),
                        'per_page' => $permissions->perPage(),
                        'total' => $permissions->total(),
                        'last_page' => $permissions->lastPage(),
                        'from' => $permissions->firstItem(),
                        'to' => $permissions->lastItem(),
                    ],
                    'stats' => $stats,
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
     * Obtener un permiso específico
     */
    public function show($id)
    {
        try {
            $permission = Permission::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'permission' => $permission
                ],
                'message' => 'Permiso obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Permiso no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo permiso
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'module' => 'required|string|max:100',
                'action' => 'required|string|max:100',
                'key' => 'required|string|max:255|unique:permissions,key',
                'label' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ], [
                'module.required' => 'El módulo es obligatorio',
                'action.required' => 'La acción es obligatoria',
                'key.required' => 'La clave es obligatoria',
                'key.unique' => 'Ya existe un permiso con esta clave',
                'label.required' => 'La etiqueta es obligatoria',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $permission = Permission::create([
                'module' => $request->module,
                'action' => $request->action,
                'key' => $request->key,
                'label' => $request->label,
                'description' => $request->description,
                'is_active' => $request->get('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'permission' => $permission
                ],
                'message' => 'Permiso creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un permiso existente
     */
    public function update(Request $request, $id)
    {
        try {
            $permission = Permission::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'module' => 'sometimes|required|string|max:100',
                'action' => 'sometimes|required|string|max:100',
                'key' => 'sometimes|required|string|max:255|unique:permissions,key,' . $permission->id,
                'label' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'is_active' => 'sometimes|boolean',
            ], [
                'module.required' => 'El módulo es obligatorio',
                'action.required' => 'La acción es obligatoria',
                'key.required' => 'La clave es obligatoria',
                'key.unique' => 'Ya existe un permiso con esta clave',
                'label.required' => 'La etiqueta es obligatoria',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['module', 'action', 'key', 'label', 'description', 'is_active']);
            $permission->update($updateData);

            return response()->json([
                'success' => true,
                'data' => [
                    'permission' => $permission
                ],
                'message' => 'Permiso actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un permiso
     */
    public function destroy($id)
    {
        try {
            $permission = Permission::findOrFail($id);

            // Verificar si hay roles usando este permiso
            $rolesCount = \App\Models\Role::whereJsonContains('permissions', $permission->key)->count();
            if ($rolesCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el permiso porque {$rolesCount} rol(es) lo están usando"
                ], 403);
            }

            $permission->delete();

            return response()->json([
                'success' => true,
                'message' => 'Permiso eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un permiso
     */
    public function toggleStatus($id)
    {
        try {
            $permission = Permission::findOrFail($id);
            $permission->is_active = !$permission->is_active;
            $permission->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'permission' => $permission
                ],
                'message' => $permission->is_active ? 'Permiso activado exitosamente' : 'Permiso desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de permisos
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_permissions' => Permission::count(),
                'active_permissions' => Permission::where('is_active', true)->count(),
                'inactive_permissions' => Permission::where('is_active', false)->count(),
                'permissions_by_module' => Permission::selectRaw('module, COUNT(*) as count')
                    ->groupBy('module')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->pluck('count', 'module'),
                'modules_count' => Permission::distinct('module')->count('module'),
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
     * Obtener módulos disponibles
     */
    public function modules()
    {
        try {
            $modules = Permission::getModules();

            return response()->json([
                'success' => true,
                'data' => [
                    'modules' => $modules
                ],
                'message' => 'Módulos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener módulos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar clave automáticamente
     */
    public function generateKey(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'module' => 'required|string|max:100',
                'action' => 'required|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $key = Permission::generateKey($request->module, $request->action);
            $label = Permission::generateLabel($request->module, $request->action);

            return response()->json([
                'success' => true,
                'data' => [
                    'key' => $key,
                    'label' => $label
                ],
                'message' => 'Clave generada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar clave',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
