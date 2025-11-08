<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CostCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Arr;

class CostCenterController extends Controller
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
     * Generar un código único para el centro de costos
     */
    private function generateUniqueCode()
    {
        do {
            $code = 'CC-' . str_pad(CostCenter::count() + 1, 4, '0', STR_PAD_LEFT);
        } while (CostCenter::where('code', $code)->exists());

        return $code;
    }

    /**
     * Listar centros de costos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = CostCenter::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->search($search);
            }

            if ($request->filled('type')) {
                $query->byType($request->type);
            }

            if ($request->filled('status')) {
                $query->byStatus($request->status);
            }

            if ($request->filled('responsible_user_id')) {
                $query->where('responsible_user_id', $request->responsible_user_id);
            }

            // Ordenamiento - por defecto por fecha de creación descendente (más recientes primero)
            $sortBy = $request->get('sort_by', 'cost_center_id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación con relaciones
            $perPage = $request->get('per_page', 15);
            $costCenters = $query->with(['responsibleUser'])->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => CostCenter::count(),
                'active' => CostCenter::where('status', 'activo')->count(),
                'closed' => CostCenter::where('status', 'cerrado')->count(),
                'paused' => CostCenter::where('status', 'pausado')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'cost_centers' => $costCenters->items(),
                    'pagination' => [
                        'current_page' => $costCenters->currentPage(),
                        'per_page' => $costCenters->perPage(),
                        'total' => $costCenters->total(),
                        'last_page' => $costCenters->lastPage(),
                        'from' => $costCenters->firstItem(),
                        'to' => $costCenters->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Centros de costos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener centros de costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un centro de costos específico
     */
    public function show($id)
    {
        try {
            $costCenter = CostCenter::with(['responsibleUser'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'cost_center' => $costCenter
                ],
                'message' => 'Centro de costos obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Centro de costos no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo centro de costos
     */
    public function store(Request $request)
    {
        try {
            $requestData = $request->all();

            // Validar que los datos sean un objeto y no un array
            if (!is_array($requestData) || $this->isArrayAList($requestData)) {
                \Log::error('Error: Se recibió un array en lugar de un objeto para la creación del centro de costos');
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de datos incorrecto. Se esperaba un objeto JSON con las propiedades del centro de costos.',
                    'errors' => ['format' => ['Se esperaba un objeto JSON con las propiedades del centro de costos, no un array']]
                ], 422);
            }

            \Log::info('Datos recibidos para crear centro de costos:', $requestData);

            $validator = Validator::make($requestData, [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'status' => 'string|in:activo,cerrado,pausado',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'status.in' => 'El estado debe ser activo, cerrado o pausado',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Auto-generar código único
            $code = $this->generateUniqueCode();
            $requestData['code'] = $code;

            // Establecer valores por defecto
            $requestData['type'] = 'Administrativo'; // Valor por defecto
            $requestData['responsible_user_id'] = null; // Opcional
            $requestData['budget'] = null; // Opcional
            $requestData['status'] = $requestData['status'] ?? 'activo';

            $costCenter = CostCenter::create($requestData);

            return response()->json([
                'success' => true,
                'data' => [
                    'cost_center' => $costCenter
                ],
                'message' => 'Centro de costos creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear centro de costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un centro de costos existente
     */
    public function update(Request $request, $id)
    {
        try {
            \Log::info('=== INICIO ACTUALIZACIÓN CENTRO DE COSTOS ===');
            \Log::info('ID recibido: ' . $id);

            $costCenter = CostCenter::findOrFail($id);

            \Log::info('Centro encontrado:', [
                'cost_center_id' => $costCenter->cost_center_id,
                'name' => $costCenter->name,
                'code' => $costCenter->code
            ]);

            \Log::info('Datos de solicitud recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'code' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:50',
                    'unique:cost_centers,code,' . $costCenter->cost_center_id . ',cost_center_id'
                ],
                'name' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|string|in:Proyecto,Administrativo,Comercial,Técnico',
                'description' => 'nullable|string|max:1000',
                'responsible_user_id' => 'sometimes|required|exists:users,id',
                'budget' => 'nullable|numeric|min:0',
                'status' => 'sometimes|string|in:activo,cerrado,pausado',
            ], [
                'code.required' => 'El código es obligatorio',
                'code.unique' => 'Este código ya está registrado',
                'name.required' => 'El nombre es obligatorio',
                'type.required' => 'El tipo es obligatorio',
                'type.in' => 'El tipo debe ser Proyecto, Administrativo, Comercial o Técnico',
                'responsible_user_id.required' => 'El usuario responsable es obligatorio',
                'responsible_user_id.exists' => 'El usuario responsable seleccionado no existe',
                'budget.numeric' => 'El presupuesto debe ser un número',
                'budget.min' => 'El presupuesto debe ser mayor o igual a 0',
                'status.in' => 'El estado debe ser activo, cerrado o pausado',
            ]);

            // Validación adicional: presupuesto obligatorio para tipo Proyecto
            $validator->after(function ($validator) use ($request) {
                if ($request->has('type') && $request->type === 'Proyecto' && !$request->has('budget') && $request->budget === null) {
                    $validator->errors()->add('budget', 'El presupuesto es obligatorio para centros de tipo Proyecto');
                }
            });

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

            $costCenter->update($validatedData);

            \Log::info('Centro de costos actualizado exitosamente:', [
                'cost_center_id' => $costCenter->cost_center_id,
                'name' => $costCenter->name,
                'code' => $costCenter->code
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'cost_center' => $costCenter
                ],
                'message' => 'Centro de costos actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar centro de costos: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar centro de costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un centro de costos
     */
    public function destroy($id)
    {
        try {
            $costCenter = CostCenter::findOrFail($id);

            // TODO: Verificar si tiene gastos asociados antes de eliminar
            // Por ahora permitimos eliminar

            $costCenter->delete();

            return response()->json([
                'success' => true,
                'message' => 'Centro de costos eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar centro de costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado de un centro de costos
     */
    public function toggleStatus($id)
    {
        try {
            $costCenter = CostCenter::findOrFail($id);

            // Lógica simple: si está activo -> cerrado, si está cerrado -> activo
            // Si está pausado -> activo
            if ($costCenter->status === 'activo') {
                $costCenter->status = 'cerrado';
            } elseif ($costCenter->status === 'cerrado') {
                $costCenter->status = 'activo';
            } elseif ($costCenter->status === 'pausado') {
                $costCenter->status = 'activo';
            }

            $costCenter->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'cost_center' => $costCenter
                ],
                'message' => 'Estado del centro de costos actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del centro de costos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de centros de costos
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_cost_centers' => CostCenter::count(),
                'active_cost_centers' => CostCenter::where('status', 'activo')->count(),
                'closed_cost_centers' => CostCenter::where('status', 'cerrado')->count(),
                'paused_cost_centers' => CostCenter::where('status', 'pausado')->count(),
                'by_type' => CostCenter::select('type')
                    ->whereNotNull('type')
                    ->distinct()
                    ->orderBy('type')
                    ->pluck('type'),
                'by_status' => [
                    'activo' => CostCenter::where('status', 'activo')->count(),
                    'cerrado' => CostCenter::where('status', 'cerrado')->count(),
                    'pausado' => CostCenter::where('status', 'pausado')->count(),
                ],
                'recent_cost_centers' => CostCenter::where('created_at', '>=', now()->subDays(30))->count(),
                'project_type_count' => CostCenter::where('type', 'Proyecto')->count(),
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
                'cost_center_types' => collect([
                    ['value' => 'Administrativo', 'label' => 'Administrativo'],
                    ['value' => 'Comercial', 'label' => 'Comercial'],
                    ['value' => 'Técnico', 'label' => 'Técnico'],
                ]),
                'cost_center_statuses' => collect([
                    ['value' => 'activo', 'label' => 'Activo'],
                    ['value' => 'cerrado', 'label' => 'Cerrado'],
                    ['value' => 'pausado', 'label' => 'Pausado'],
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
