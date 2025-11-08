<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Arr;

class SupplierController extends Controller
{
    /**
     * Check if an array is a list (indexed array with sequential numeric keys)
     */
    private function isArrayAList($array)
    {
        if (!is_array($array)) {
            return false;
        }

        return Arr::isList($array);
    }

    /**
     * Listar proveedores con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Supplier::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->search($search);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            if ($request->filled('supplier_type')) {
                $query->where('supplier_type', $request->supplier_type);
            }

            // Ordenamiento - por defecto por fecha de creación descendente (más recientes primero)
            $sortBy = $request->get('sort_by', 'supplier_id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación con relaciones
            $perPage = $request->get('per_page', 15);
            $suppliers = $query->with(['responsibleUser', 'department', 'city'])->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Supplier::count(),
                'active' => Supplier::where('is_active', true)->count(),
                'inactive' => Supplier::where('is_active', false)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'suppliers' => $suppliers->items(),
                    'pagination' => [
                        'current_page' => $suppliers->currentPage(),
                        'per_page' => $suppliers->perPage(),
                        'total' => $suppliers->total(),
                        'last_page' => $suppliers->lastPage(),
                        'from' => $suppliers->firstItem(),
                        'to' => $suppliers->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Proveedores obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un proveedor específico
     */
    public function show($id)
    {
        try {
            $supplier = Supplier::with(['responsibleUser', 'department', 'city'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier' => $supplier
                ],
                'message' => 'Proveedor obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proveedor no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo proveedor
     */
    public function store(Request $request)
    {
        try {
            $requestData = $request->all();

            // Validar que los datos sean un objeto y no un array
            if (!is_array($requestData) || $this->isArrayAList($requestData)) {
                \Log::error('Error: Se recibió un array en lugar de un objeto para la creación del proveedor');
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de datos incorrecto. Se esperaba un objeto JSON con las propiedades del proveedor.',
                    'errors' => ['format' => ['Se esperaba un objeto JSON con las propiedades del proveedor, no un array']]
                ], 422);
            }

            \Log::info('Datos recibidos para crear proveedor:', $requestData);

            $validator = Validator::make($requestData, [
                'name' => 'required|string|max:255',
                'supplier_type' => 'required|string|in:empresa,persona',
                'email' => 'required|email|unique:suppliers,email,NULL,supplier_id',
                'phone' => 'nullable|string|max:20',
                'nit' => 'nullable|string|max:50|unique:suppliers,nit,NULL,supplier_id',
                'responsible_user_id' => 'nullable|exists:users,id',
                'department_id' => 'nullable|exists:departments,department_id',
                'city_id' => 'nullable|exists:cities,city_id',
                'address' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'supplier_type.required' => 'El tipo de proveedor es obligatorio',
                'supplier_type.in' => 'El tipo de proveedor debe ser empresa o persona',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'department_id.exists' => 'El departamento seleccionado no existe',
                'city_id.exists' => 'La ciudad seleccionada no existe',
                'responsible_user_id.exists' => 'El usuario responsable seleccionado no existe',
                'nit.unique' => 'Este NIT ya está registrado',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si no se proporciona un usuario responsable, usar el usuario autenticado
            $requestData = $request->all();
            if (!isset($requestData['responsible_user_id'])) {
                $requestData['responsible_user_id'] = auth()->id();
            }

            $supplier = Supplier::create($requestData);

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier' => $supplier
                ],
                'message' => 'Proveedor creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un proveedor existente
     */
    public function update(Request $request, $id)
    {
        try {
            \Log::info('=== INICIO ACTUALIZACIÓN PROVEEDOR ===');
            \Log::info('ID recibido: ' . $id);

            $supplier = Supplier::findOrFail($id);

            \Log::info('Proveedor encontrado:', [
                'supplier_id' => $supplier->supplier_id,
                'name' => $supplier->name,
                'email' => $supplier->email
            ]);

            \Log::info('Datos de solicitud recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'supplier_type' => 'sometimes|required|string|in:empresa,persona',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    'unique:suppliers,email,' . $supplier->supplier_id . ',supplier_id'
                ],
                'phone' => 'nullable|string|max:20',
                'nit' => [
                    'nullable',
                    'string',
                    'max:50',
                    'unique:suppliers,nit,' . $supplier->supplier_id . ',supplier_id'
                ],
                'responsible_user_id' => 'nullable|exists:users,id',
                'department_id' => 'nullable|exists:departments,department_id',
                'city_id' => 'nullable|exists:cities,city_id',
                'address' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'sometimes|boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'supplier_type.required' => 'El tipo de proveedor es obligatorio',
                'supplier_type.in' => 'El tipo de proveedor debe ser empresa o persona',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'responsible_user_id.exists' => 'El usuario responsable seleccionado no existe',
                'department_id.exists' => 'El departamento seleccionado no existe',
                'city_id.exists' => 'La ciudad seleccionada no existe',
                'nit.unique' => 'Este NIT ya está registrado',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            \Log::info('Datos validados:', $validatedData);

            $supplier->update($validatedData);

            \Log::info('Proveedor actualizado exitosamente:', [
                'supplier_id' => $supplier->supplier_id,
                'name' => $supplier->name,
                'email' => $supplier->email
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier' => $supplier
                ],
                'message' => 'Proveedor actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar proveedor: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un proveedor
     */
    public function destroy($id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proveedor eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un proveedor
     */
    public function toggleStatus($id)
    {
        try {
            $supplier = Supplier::findOrFail($id);
            $supplier->is_active = !$supplier->is_active;
            $supplier->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier' => $supplier
                ],
                'message' => $supplier->is_active ? 'Proveedor activado exitosamente' : 'Proveedor desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de proveedores
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_suppliers' => Supplier::count(),
                'active_suppliers' => Supplier::where('is_active', true)->count(),
                'inactive_suppliers' => Supplier::where('is_active', false)->count(),
                'by_type' => Supplier::select('supplier_type')
                    ->whereNotNull('supplier_type')
                    ->distinct()
                    ->orderBy('supplier_type')
                    ->pluck('supplier_type'),
                'recent_suppliers' => Supplier::where('created_at', '>=', now()->subDays(30))->count(),
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
                'supplier_types' => collect([
                    ['value' => 'empresa', 'label' => 'Empresa'],
                    ['value' => 'persona', 'label' => 'Persona Natural'],
                ]),
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
