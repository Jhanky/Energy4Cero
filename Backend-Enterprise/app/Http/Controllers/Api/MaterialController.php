<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MaterialsImport;
use App\Exports\MaterialsExport;

class MaterialController extends Controller
{
    /**
     * Listar materiales con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Material::with(['warehouse']);

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('product_id', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
                });
            }

            if ($request->filled('warehouse_id')) {
                $query->where('warehouse_id', $request->warehouse_id);
            }

            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Filtro por stock
            if ($request->filled('stock_status')) {
                if ($request->stock_status === 'low_stock') {
                    $query->where('quantity', '<', 10);
                } elseif ($request->stock_status === 'out_of_stock') {
                    $query->where('quantity', '=', 0);
                } elseif ($request->stock_status === 'in_stock') {
                    $query->where('quantity', '>', 0);
                }
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'product_id');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $materials = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Material::count(),
                'active' => Material::where('is_active', true)->count(),
                'inactive' => Material::where('is_active', false)->count(),
                'in_warehouses' => Material::whereNotNull('warehouse_id')->count(),
                'unassigned' => Material::whereNull('warehouse_id')->count(),
                'low_stock' => Material::where('quantity', '<', 10)->where('quantity', '>', 0)->count(),
                'out_of_stock' => Material::where('quantity', '=', 0)->count(),
                'total_value' => Material::sum('quantity'), // Simplificado, se puede mejorar con precios
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $materials->items(),
                    'pagination' => [
                        'current_page' => $materials->currentPage(),
                        'per_page' => $materials->perPage(),
                        'total' => $materials->total(),
                        'last_page' => $materials->lastPage(),
                        'from' => $materials->firstItem(),
                        'to' => $materials->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Materiales obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener materiales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo material
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|string|max:255|unique:materials,product_id',
                'description' => 'required|string|max:1000',
                'quantity' => 'required|numeric|min:0',
                'unit_measure' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ], [
                'product_id.required' => 'El ID del producto es obligatorio',
                'product_id.unique' => 'Este ID de producto ya está registrado',
                'description.required' => 'La descripción es obligatoria',
                'quantity.required' => 'La cantidad es obligatoria',
                'quantity.numeric' => 'La cantidad debe ser un número',
                'quantity.min' => 'La cantidad debe ser mayor o igual a 0',
                'unit_measure.required' => 'La unidad de medida es obligatoria',
                'category.required' => 'La categoría es obligatoria',
                'warehouse_id.exists' => 'La bodega seleccionada no existe',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material = Material::create($request->all());

            return response()->json([
                'success' => true,
                'data' => [
                    'material' => $material->load(['warehouse'])
                ],
                'message' => 'Material creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un material específico
     */
    public function show($id)
    {
        try {
            $material = Material::with(['warehouse'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'material' => $material
                ],
                'message' => 'Material obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar un material existente
     */
    public function update(Request $request, $id)
    {
        try {
            $material = Material::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'product_id' => 'sometimes|required|string|max:255|unique:materials,product_id,' . $material->id,
                'description' => 'sometimes|required|string|max:1000',
                'quantity' => 'sometimes|required|numeric|min:0',
                'unit_measure' => 'sometimes|required|string|max:255',
                'category' => 'sometimes|required|string|max:255',
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'sometimes|boolean',
            ], [
                'product_id.required' => 'El ID del producto es obligatorio',
                'product_id.unique' => 'Este ID de producto ya está registrado',
                'description.required' => 'La descripción es obligatoria',
                'quantity.required' => 'La cantidad es obligatoria',
                'quantity.numeric' => 'La cantidad debe ser un número',
                'quantity.min' => 'La cantidad debe ser mayor o igual a 0',
                'unit_measure.required' => 'La unidad de medida es obligatoria',
                'category.required' => 'La categoría es obligatoria',
                'warehouse_id.exists' => 'La bodega seleccionada no existe',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material->update($request->all());
            $material->load(['warehouse']);

            return response()->json([
                'success' => true,
                'data' => [
                    'material' => $material
                ],
                'message' => 'Material actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un material
     */
    public function destroy($id)
    {
        try {
            $material = Material::findOrFail($id);
            $material->delete();

            return response()->json([
                'success' => true,
                'message' => 'Material eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un material
     */
    public function toggleStatus($id)
    {
        try {
            $material = Material::findOrFail($id);
            $material->is_active = !$material->is_active;
            $material->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'material' => $material->load(['warehouse'])
                ],
                'message' => $material->is_active ? 'Material activado exitosamente' : 'Material desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de materiales
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_materials' => Material::count(),
                'active_materials' => Material::where('is_active', true)->count(),
                'inactive_materials' => Material::where('is_active', false)->count(),
                'materials_in_warehouses' => Material::whereNotNull('warehouse_id')->count(),
                'unassigned_materials' => Material::whereNull('warehouse_id')->count(),
                'low_stock_materials' => Material::where('quantity', '<', 10)->where('quantity', '>', 0)->count(),
                'out_of_stock_materials' => Material::where('quantity', '=', 0)->count(),
                'by_category' => Material::select('category')
                    ->selectRaw('COUNT(*) as count')
                    ->groupBy('category')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'category' => $item->category,
                            'count' => $item->count
                        ];
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
                'categories' => Material::select('category')
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->orderBy('category')
                    ->get()
                    ->map(function ($material) {
                        return [
                            'value' => $material->category,
                            'label' => $material->category
                        ];
                    }),
                'unit_measures' => [
                    ['value' => 'unidades', 'label' => 'Unidades'],
                    ['value' => 'metros', 'label' => 'Metros'],
                    ['value' => 'kilogramos', 'label' => 'Kilogramos'],
                    ['value' => 'litros', 'label' => 'Litros'],
                    ['value' => 'paquetes', 'label' => 'Paquetes'],
                    ['value' => 'cajas', 'label' => 'Cajas'],
                    ['value' => 'rollos', 'label' => 'Rollos'],
                    ['value' => 'bobinas', 'label' => 'Bobinas'],
                ],
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

    /**
     * Importar materiales desde Excel
     */
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls|max:10240', // 10MB máximo
            ], [
                'file.required' => 'El archivo es obligatorio',
                'file.file' => 'Debe ser un archivo válido',
                'file.mimes' => 'El archivo debe ser de tipo Excel (.xlsx, .xls)',
                'file.max' => 'El archivo no debe superar los 10MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            $import = new MaterialsImport();
            Excel::import($import, $request->file('file'));

            $results = $import->getResults();

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $results
                ],
                'message' => 'Materiales importados exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al importar materiales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar materiales a Excel
     */
    public function export(Request $request)
    {
        try {
            $filename = 'materiales_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            return Excel::download(new MaterialsExport($request->all()), $filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar materiales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualización masiva de materiales
     */
    public function bulkUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'materials' => 'required|array|min:1',
                'materials.*.id' => 'required|exists:materials,id',
                'materials.*.quantity' => 'sometimes|numeric|min:0',
                'materials.*.warehouse_id' => 'sometimes|nullable|exists:warehouses,id',
                'materials.*.is_active' => 'sometimes|boolean',
            ], [
                'materials.required' => 'Los materiales son obligatorios',
                'materials.array' => 'Los materiales deben ser un arreglo',
                'materials.min' => 'Debe actualizar al menos un material',
                'materials.*.id.required' => 'El ID del material es obligatorio',
                'materials.*.id.exists' => 'Uno o más materiales no existen',
                'materials.*.quantity.numeric' => 'La cantidad debe ser un número',
                'materials.*.quantity.min' => 'La cantidad debe ser mayor o igual a 0',
                'materials.*.warehouse_id.exists' => 'La bodega seleccionada no existe',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updatedMaterials = [];
            foreach ($request->materials as $materialData) {
                $material = Material::find($materialData['id']);
                unset($materialData['id']); // Remover ID del array de actualización
                $material->update($materialData);
                $updatedMaterials[] = $material->load(['warehouse']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $updatedMaterials,
                    'updated_count' => count($updatedMaterials)
                ],
                'message' => count($updatedMaterials) . ' materiales actualizados exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar materiales',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
