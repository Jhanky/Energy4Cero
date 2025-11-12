<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WarehouseController extends Controller
{
    /**
     * Listar bodegas con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Warehouse::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%")
                      ->orWhere('manager', 'like', "%{$search}%");
                });
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación con relaciones
            $perPage = $request->get('per_page', 15);
            $warehouses = $query->withCount('tools')->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Warehouse::count(),
                'active' => Warehouse::where('is_active', true)->count(),
                'inactive' => Warehouse::where('is_active', false)->count(),
                'with_tools' => Warehouse::has('tools')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouses' => $warehouses->items(),
                    'pagination' => [
                        'current_page' => $warehouses->currentPage(),
                        'per_page' => $warehouses->perPage(),
                        'total' => $warehouses->total(),
                        'last_page' => $warehouses->lastPage(),
                        'from' => $warehouses->firstItem(),
                        'to' => $warehouses->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Bodegas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva bodega
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'location' => 'nullable|string|max:255',
                'manager' => 'nullable|string|max:255',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.max' => 'El nombre no puede exceder 255 caracteres',
                'description.max' => 'La descripción no puede exceder 1000 caracteres',
                'location.max' => 'La ubicación no puede exceder 255 caracteres',
                'manager.max' => 'El encargado no puede exceder 255 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $warehouse = Warehouse::create($request->all());

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouse' => $warehouse
                ],
                'message' => 'Bodega creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una bodega específica
     */
    public function show($id)
    {
        try {
            $warehouse = Warehouse::with(['tools.toolState'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouse' => $warehouse
                ],
                'message' => 'Bodega obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bodega no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar una bodega existente
     */
    public function update(Request $request, $id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'location' => 'nullable|string|max:255',
                'manager' => 'nullable|string|max:255',
                'is_active' => 'sometimes|boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.max' => 'El nombre no puede exceder 255 caracteres',
                'description.max' => 'La descripción no puede exceder 1000 caracteres',
                'location.max' => 'La ubicación no puede exceder 255 caracteres',
                'manager.max' => 'El encargado no puede exceder 255 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $warehouse->update($request->all());

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouse' => $warehouse
                ],
                'message' => 'Bodega actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una bodega
     */
    public function destroy($id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);

            // Verificar si tiene herramientas asignadas
            if ($warehouse->tools()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la bodega porque tiene herramientas asignadas'
                ], 422);
            }

            $warehouse->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bodega eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de una bodega
     */
    public function toggleStatus($id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);
            $warehouse->is_active = !$warehouse->is_active;
            $warehouse->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouse' => $warehouse
                ],
                'message' => $warehouse->is_active ? 'Bodega activada exitosamente' : 'Bodega desactivada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de la bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de bodegas
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_warehouses' => Warehouse::count(),
                'active_warehouses' => Warehouse::where('is_active', true)->count(),
                'inactive_warehouses' => Warehouse::where('is_active', false)->count(),
                'warehouses_with_tools' => Warehouse::has('tools')->count(),
                'total_tools_in_warehouses' => Warehouse::join('tools', 'warehouses.id', '=', 'tools.warehouse_id')->count(),
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
     * Obtener opciones para formularios
     */
    public function options()
    {
        try {
            $options = [
                'warehouses' => Warehouse::where('is_active', true)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->map(function ($warehouse) {
                        return [
                            'value' => $warehouse->id,
                            'label' => $warehouse->name
                        ];
                    }),
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
