<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Warehouse;
use App\Models\Project;
use App\Models\ToolState;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ToolController extends Controller
{
    /**
     * Listar herramientas con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Tool::with(['warehouse', 'project', 'toolState']);

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            }

            if ($request->filled('warehouse_id')) {
                $query->where('warehouse_id', $request->warehouse_id);
            }

            if ($request->filled('project_id')) {
                $query->where('project_id', $request->project_id);
            }

            if ($request->filled('tool_state_id')) {
                $query->where('tool_state_id', $request->tool_state_id);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Filtro por ubicación
            if ($request->filled('location_type')) {
                if ($request->location_type === 'warehouse') {
                    $query->whereNotNull('warehouse_id')->whereNull('project_id');
                } elseif ($request->location_type === 'project') {
                    $query->whereNull('warehouse_id')->whereNotNull('project_id');
                } elseif ($request->location_type === 'unassigned') {
                    $query->whereNull('warehouse_id')->whereNull('project_id');
                }
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $tools = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Tool::count(),
                'active' => Tool::where('is_active', true)->count(),
                'inactive' => Tool::where('is_active', false)->count(),
                'in_warehouses' => Tool::whereNotNull('warehouse_id')->count(),
                'in_projects' => Tool::whereNotNull('project_id')->count(),
                'unassigned' => Tool::whereNull('warehouse_id')->whereNull('project_id')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'tools' => $tools->items(),
                    'pagination' => [
                        'current_page' => $tools->currentPage(),
                        'per_page' => $tools->perPage(),
                        'total' => $tools->total(),
                        'last_page' => $tools->lastPage(),
                        'from' => $tools->firstItem(),
                        'to' => $tools->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Herramientas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener herramientas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva herramienta
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:tools,code',
                'description' => 'nullable|string|max:1000',
                'brand' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'project_id' => 'nullable|exists:projects,id',
                'tool_state_id' => 'required|exists:tool_states,id',
                'is_active' => 'boolean',
                'notes' => 'nullable|string|max:1000',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'code.required' => 'El código es obligatorio',
                'code.unique' => 'Este código ya está registrado',
                'purchase_date.date' => 'La fecha de compra debe ser una fecha válida',
                'purchase_price.numeric' => 'El precio de compra debe ser un número',
                'purchase_price.min' => 'El precio de compra debe ser mayor o igual a 0',
                'warehouse_id.exists' => 'La bodega seleccionada no existe',
                'project_id.exists' => 'El proyecto seleccionado no existe',
                'tool_state_id.required' => 'El estado de la herramienta es obligatorio',
                'tool_state_id.exists' => 'El estado seleccionado no existe',
            ]);

            // Validación adicional: no puede estar en warehouse y project al mismo tiempo
            $validator->after(function ($validator) use ($request) {
                if ($request->filled('warehouse_id') && $request->filled('project_id')) {
                    $validator->errors()->add('location', 'La herramienta no puede estar asignada a una bodega y un proyecto al mismo tiempo');
                }
            });

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tool = Tool::create($request->all());

            return response()->json([
                'success' => true,
                'data' => [
                    'tool' => $tool->load(['warehouse', 'project', 'toolState'])
                ],
                'message' => 'Herramienta creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear herramienta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una herramienta específica
     */
    public function show($id)
    {
        try {
            $tool = Tool::with(['warehouse', 'project', 'toolState'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'tool' => $tool
                ],
                'message' => 'Herramienta obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Herramienta no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar una herramienta existente
     */
    public function update(Request $request, $id)
    {
        try {
            $tool = Tool::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'code' => 'sometimes|required|string|max:255|unique:tools,code,' . $tool->id,
                'description' => 'nullable|string|max:1000',
                'brand' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'project_id' => 'nullable|exists:projects,id',
                'tool_state_id' => 'sometimes|required|exists:tool_states,id',
                'is_active' => 'sometimes|boolean',
                'notes' => 'nullable|string|max:1000',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'code.required' => 'El código es obligatorio',
                'code.unique' => 'Este código ya está registrado',
                'purchase_date.date' => 'La fecha de compra debe ser una fecha válida',
                'purchase_price.numeric' => 'El precio de compra debe ser un número',
                'purchase_price.min' => 'El precio de compra debe ser mayor o igual a 0',
                'warehouse_id.exists' => 'La bodega seleccionada no existe',
                'project_id.exists' => 'El proyecto seleccionado no existe',
                'tool_state_id.required' => 'El estado de la herramienta es obligatorio',
                'tool_state_id.exists' => 'El estado seleccionado no existe',
            ]);

            // Validación adicional: no puede estar en warehouse y project al mismo tiempo
            $validator->after(function ($validator) use ($request) {
                if ($request->filled('warehouse_id') && $request->filled('project_id')) {
                    $validator->errors()->add('location', 'La herramienta no puede estar asignada a una bodega y un proyecto al mismo tiempo');
                }
            });

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tool->update($request->all());
            $tool->load(['warehouse', 'project', 'toolState']);

            return response()->json([
                'success' => true,
                'data' => [
                    'tool' => $tool
                ],
                'message' => 'Herramienta actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar herramienta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una herramienta
     */
    public function destroy($id)
    {
        try {
            $tool = Tool::findOrFail($id);
            $tool->delete();

            return response()->json([
                'success' => true,
                'message' => 'Herramienta eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar herramienta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de una herramienta
     */
    public function toggleStatus($id)
    {
        try {
            $tool = Tool::findOrFail($id);
            $tool->is_active = !$tool->is_active;
            $tool->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'tool' => $tool->load(['warehouse', 'project', 'toolState'])
                ],
                'message' => $tool->is_active ? 'Herramienta activada exitosamente' : 'Herramienta desactivada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de la herramienta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de herramientas
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_tools' => Tool::count(),
                'active_tools' => Tool::where('is_active', true)->count(),
                'inactive_tools' => Tool::where('is_active', false)->count(),
                'tools_in_warehouses' => Tool::whereNotNull('warehouse_id')->count(),
                'tools_in_projects' => Tool::whereNotNull('project_id')->count(),
                'unassigned_tools' => Tool::whereNull('warehouse_id')->whereNull('project_id')->count(),
                'by_state' => ToolState::withCount('tools')->get()->map(function ($state) {
                    return [
                        'state' => $state->name,
                        'count' => $state->tools_count,
                        'color' => $state->color
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
                'tool_states' => ToolState::where('is_active', true)
                    ->select('id', 'name', 'color')
                    ->orderBy('name')
                    ->get()
                    ->map(function ($state) {
                        return [
                            'value' => $state->id,
                            'label' => $state->name,
                            'color' => $state->color
                        ];
                    }),
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
                'projects' => Project::where('is_active', true)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->map(function ($project) {
                        return [
                            'value' => $project->id,
                            'label' => $project->name
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

    /**
     * Mover herramienta a una ubicación diferente
     */
    public function move(Request $request, $id)
    {
        try {
            $tool = Tool::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'project_id' => 'nullable|exists:projects,id',
            ], [
                'warehouse_id.exists' => 'La bodega seleccionada no existe',
                'project_id.exists' => 'El proyecto seleccionado no existe',
            ]);

            // Validación adicional: no puede estar en warehouse y project al mismo tiempo
            $validator->after(function ($validator) use ($request) {
                if ($request->filled('warehouse_id') && $request->filled('project_id')) {
                    $validator->errors()->add('location', 'La herramienta no puede estar asignada a una bodega y un proyecto al mismo tiempo');
                }
            });

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tool->update([
                'warehouse_id' => $request->warehouse_id,
                'project_id' => $request->project_id,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'tool' => $tool->load(['warehouse', 'project', 'toolState'])
                ],
                'message' => 'Herramienta movida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al mover herramienta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
