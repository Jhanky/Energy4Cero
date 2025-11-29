<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectMaterial;
use App\Models\RemissionItem;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProjectMaterialController extends Controller
{
    /**
     * Listar materiales de un proyecto con estado actualizado basado en remisiones
     */
    public function index(Request $request, $projectId)
    {
        try {
            if (!$projectId) {
                return response()->json([
                    'success' => false,
                    'message' => 'El ID del proyecto es obligatorio'
                ], 400);
            }

            // Verificar que el proyecto existe
            $project = Project::findOrFail($projectId);

            // Actualizar estado de materiales basado en remisiones
            $this->updateMaterialsInProjectStatus($projectId);

            $query = ProjectMaterial::with(['creator'])
                ->forProject($projectId);

            // Filtros
            if ($request->filled('category')) {
                $query->byCategory($request->category);
            }

            if ($request->filled('is_in_project')) {
                $query->where('is_in_project', $request->boolean('is_in_project'));
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $materials = $query->get();

            // Estadísticas
            $stats = [
                'total' => $materials->count(),
                'in_project' => $materials->where('is_in_project', true)->count(),
                'pending' => $materials->where('is_in_project', false)->count(),
                'by_category' => $materials->groupBy('category')->map->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $materials,
                    'stats' => $stats
                ],
                'message' => 'Materiales del proyecto obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener materiales del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo material para el proyecto
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'description' => 'required|string|max:1000',
                'quantity' => 'required|numeric|min:0.01',
                'unit_measure' => 'required|string|max:255',
                'category' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ], [
                'project_id.required' => 'El proyecto es obligatorio',
                'project_id.exists' => 'El proyecto seleccionado no existe',
                'description.required' => 'La descripción del material es obligatoria',
                'quantity.required' => 'La cantidad es obligatoria',
                'quantity.numeric' => 'La cantidad debe ser un número',
                'quantity.min' => 'La cantidad debe ser mayor a 0',
                'unit_measure.required' => 'La unidad de medida es obligatoria',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material = ProjectMaterial::create([
                'project_id' => $request->project_id,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'unit_measure' => $request->unit_measure,
                'category' => $request->category,
                'notes' => $request->notes,
                'created_by' => auth()->id() ?? 1, // Fallback para testing
                'is_in_project' => false // Siempre inicia como no entregado
            ]);

            // Cargar relaciones para respuesta
            $material->load(['creator']);

            return response()->json([
                'success' => true,
                'data' => [
                    'material' => $material
                ],
                'message' => 'Material agregado al proyecto exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear material del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un material específico del proyecto
     */
    public function show($id)
    {
        try {
            $material = ProjectMaterial::with(['project', 'creator'])->findOrFail($id);

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
     * Actualizar un material del proyecto
     */
    public function update(Request $request, $id)
    {
        try {
            $material = ProjectMaterial::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'description' => 'sometimes|required|string|max:1000',
                'quantity' => 'sometimes|required|numeric|min:0.01',
                'unit_measure' => 'sometimes|required|string|max:255',
                'category' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ], [
                'description.required' => 'La descripción del material es obligatoria',
                'quantity.required' => 'La cantidad es obligatoria',
                'quantity.numeric' => 'La cantidad debe ser un número',
                'quantity.min' => 'La cantidad debe ser mayor a 0',
                'unit_measure.required' => 'La unidad de medida es obligatoria',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material->update($request->only([
                'description', 'quantity', 'unit_measure', 'category', 'notes'
            ]));

            $material->load(['creator']);

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
     * Eliminar un material del proyecto
     */
    public function destroy($id)
    {
        try {
            $material = ProjectMaterial::findOrFail($id);
            $material->delete();

            return response()->json([
                'success' => true,
                'message' => 'Material eliminado del proyecto exitosamente'
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
     * Actualizar el estado de los materiales basado en remisiones existentes
     */
    private function updateMaterialsInProjectStatus($projectId)
    {
        try {
            // Obtener todos los materiales del proyecto que no están marcados como en proyecto
            $materials = ProjectMaterial::forProject($projectId)->notInProject()->get();

            foreach ($materials as $material) {
                // Verificar si existe alguna remisión que incluya este material
                $hasRemission = RemissionItem::whereHas('remission', function ($query) use ($projectId) {
                    $query->where('project_id', $projectId);
                })
                ->whereHas('material', function ($query) use ($material) {
                    // Comparar por descripción o algún campo identificador
                    // Como no hay relación directa, comparamos por descripción similar
                    $query->where('description', 'LIKE', '%' . $material->description . '%');
                })
                ->exists();

                if ($hasRemission) {
                    $material->update(['is_in_project' => true]);
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            \Log::error('Error updating materials status: ' . $e->getMessage());
        }
    }

    /**
     * Crear múltiples materiales para el proyecto en una sola transacción
     */
    public function bulkStore(Request $request)
    {
        try {
            $projectId = $request->input('project_id');

            if (!$projectId) {
                return response()->json([
                    'success' => false,
                    'message' => 'El ID del proyecto es obligatorio'
                ], 400);
            }

            // Verificar que el proyecto existe
            $project = Project::findOrFail($projectId);

            $materials = $request->input('materials', []);

            if (empty($materials) || !is_array($materials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe proporcionar un array de materiales'
                ], 400);
            }

            if (count($materials) > 100) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puede crear más de 100 materiales a la vez'
                ], 400);
            }

            $createdMaterials = [];
            $errors = [];

            // Usar transacción para asegurar atomicidad
            DB::transaction(function () use ($materials, $projectId, &$createdMaterials, &$errors) {
                foreach ($materials as $index => $materialData) {
                    try {
                        $validator = Validator::make($materialData, [
                            'description' => 'required|string|max:1000',
                            'quantity' => 'required|numeric|min:0.01',
                            'unit_measure' => 'required|string|max:255',
                            'category' => 'nullable|string|max:255',
                            'notes' => 'nullable|string|max:1000',
                        ], [
                            'description.required' => 'La descripción del material es obligatoria',
                            'quantity.required' => 'La cantidad es obligatoria',
                            'quantity.numeric' => 'La cantidad debe ser un número',
                            'quantity.min' => 'La cantidad debe ser mayor a 0',
                            'unit_measure.required' => 'La unidad de medida es obligatoria',
                        ]);

                        if ($validator->fails()) {
                            $errors[] = [
                                'index' => $index,
                                'errors' => $validator->errors()
                            ];
                            continue;
                        }

                        $material = ProjectMaterial::create([
                            'project_id' => $projectId,
                            'description' => $materialData['description'],
                            'quantity' => $materialData['quantity'],
                            'unit_measure' => $materialData['unit_measure'],
                            'category' => $materialData['category'] ?? null,
                            'notes' => $materialData['notes'] ?? null,
                            'created_by' => auth()->id() ?? 1, // Fallback para testing
                            'is_in_project' => false // Siempre inicia como no entregado
                        ]);

                        $material->load(['creator']);
                        $createdMaterials[] = $material;

                    } catch (\Exception $e) {
                        $errors[] = [
                            'index' => $index,
                            'error' => $e->getMessage()
                        ];
                    }
                }
            });

            if (!empty($errors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Algunos materiales no pudieron ser creados',
                    'data' => [
                        'created_materials' => $createdMaterials,
                        'errors' => $errors
                    ]
                ], 207); // Multi-Status
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'materials' => $createdMaterials,
                    'count' => count($createdMaterials)
                ],
                'message' => count($createdMaterials) . ' materiales agregados al proyecto exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear materiales del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de materiales del proyecto
     */
    public function statistics($projectId)
    {
        try {
            $materials = ProjectMaterial::forProject($projectId)->get();

            $stats = [
                'total_materials' => $materials->count(),
                'materials_in_project' => $materials->where('is_in_project', true)->count(),
                'materials_pending' => $materials->where('is_in_project', false)->count(),
                'total_quantity' => $materials->sum('quantity'),
                'by_category' => $materials->groupBy('category')->map(function ($group) {
                    return [
                        'count' => $group->count(),
                        'total_quantity' => $group->sum('quantity'),
                        'in_project' => $group->where('is_in_project', true)->count()
                    ];
                }),
                'by_unit_measure' => $materials->groupBy('unit_measure')->map(function ($group) {
                    return [
                        'count' => $group->count(),
                        'total_quantity' => $group->sum('quantity')
                    ];
                })
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
}
