<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\CostCenter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Project::with(['client' => function($q) {
                $q->with(['department', 'city', 'responsibleUser']);
            }, 'currentState', 'quotation' => function($q) {
                $q->with(['usedProducts', 'items']);
            }]);

            // Apply filters
            if ($request->has('search') && $request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('code', 'like', '%' . $request->search . '%')
                      ->orWhereHas('client', function ($q2) use ($request) {
                          $q2->where('name', 'like', '%' . $request->search . '%');
                      });
                });
            }

            if ($request->has('state_id') && $request->state_id) {
                $query->where('current_state_id', $request->state_id);
            }

            if ($request->has('project_type') && $request->project_type) {
                $query->where('project_type', $request->project_type);
            }

            if ($request->has('department') && $request->department) {
                $query->where('department', $request->department);
            }

            $perPage = $request->get('per_page', 15);
            $projects = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $projects,
                'message' => 'Proyectos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los proyectos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'client_id' => 'required|exists:clients,id',
                'capacity_dc' => 'required|numeric|min:0',
                'capacity_ac' => 'required|numeric|min:0',
                'number_panels' => 'required|integer|min:0',
                'number_inverters' => 'required|integer|min:0',
                'contract_value' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'estimated_completion_date' => 'required|date|after_or_equal:start_date',
                'current_state_id' => 'required|exists:project_states,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate unique project code
            $lastProject = Project::orderBy('id', 'desc')->first();
            $nextId = $lastProject ? $lastProject->id + 1 : 1;
            $code = 'PV-' . date('Y') . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

            $projectData = $request->all();
            $projectData['code'] = $code;
            $projectData['created_by'] = auth()->id();
            $projectData['updated_by'] = auth()->id();

            $project = Project::create($projectData);

            // Asignar automáticamente centro de costos basado en el departamento
            $this->assignCostCenterToProject($project);

            return response()->json([
                'success' => true,
                'data' => $project->load(['client', 'currentState', 'costCenter']),
                'message' => 'Proyecto creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $project = Project::with(['client' => function($q) {
                $q->with(['department', 'city', 'responsibleUser']);
            }, 'currentState', 'milestones', 'documents', 'stateHistory', 'quotation' => function($q) {
                $q->with(['usedProducts', 'items']);
            }])->find($id);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $project,
                'message' => 'Proyecto obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $project = Project::find($id);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'client_id' => 'sometimes|required|exists:clients,id',
                'capacity_dc' => 'sometimes|required|numeric|min:0',
                'capacity_ac' => 'sometimes|required|numeric|min:0',
                'number_panels' => 'sometimes|required|integer|min:0',
                'number_inverters' => 'sometimes|required|integer|min:0',
                'contract_value' => 'sometimes|required|numeric|min:0',
                'start_date' => 'sometimes|required|date',
                'estimated_completion_date' => 'sometimes|required|date|after_or_equal:start_date',
                'current_state_id' => 'sometimes|required|exists:project_states,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $projectData = $request->all();
            $projectData['updated_by'] = auth()->id();

            $project->update($projectData);

            return response()->json([
                'success' => true,
                'data' => $project->load(['client' => function($q) {
                    $q->with(['department', 'city', 'responsibleUser']);
                }, 'currentState', 'quotation' => function($q) {
                    $q->with(['usedProducts', 'items']);
                }]),
                'message' => 'Proyecto actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $project = Project::find($id);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $project->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proyecto eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateState(Request $request, string $id): JsonResponse
    {
        try {
            $project = Project::find($id);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'current_state_id' => 'required|exists:project_states,id',
                'reason' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldStateId = $project->current_state_id;
            $newStateId = $request->current_state_id;

            // Update project state
            $project->update([
                'current_state_id' => $newStateId,
                'updated_by' => auth()->id()
            ]);

            // Create state history record
            $project->stateHistory()->create([
                'from_state_id' => $oldStateId,
                'to_state_id' => $newStateId,
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
                'changed_at' => now(),
            ]);

            // Update progress percentage based on state
            $this->updateProgressByState($project, $newStateId);

            return response()->json([
                'success' => true,
                'data' => $project->load(['client' => function($q) {
                    $q->with(['department', 'city', 'responsibleUser']);
                }, 'currentState', 'quotation' => function($q) {
                    $q->with(['usedProducts', 'items']);
                }]),
                'message' => 'Estado del proyecto actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function updateProgressByState(Project $project, int $newStateId): void
    {
        // Update progress based on the project state
        // This is a simplified example - you can adjust the percentages as needed
        $stateProgressMap = [
            1 => 5,    // Preparación de Solicitud
            2 => 10,   // Solicitud Presentada
            3 => 20,   // Revisión de Completitud
            4 => 30,   // Revisión Técnica
            5 => 40,   // Concepto de Viabilidad Emitido
            6 => 50,   // Instalación en Proceso - starting at 50%
            7 => 80,   // Inspección Pendiente
            8 => 85,   // Inspección Realizada
            9 => 90,   // Observaciones de Inspección
            10 => 95,  // Aprobación Final
            11 => 100, // Conectado y Operando
            12 => $project->progress_percentage, // Suspendido - keep current progress
            13 => 0,   // Cancelado - reset to 0
        ];

        $progress = $stateProgressMap[$newStateId] ?? $project->progress_percentage;

        if ($newStateId !== 12) { // Not suspended
            $project->update(['progress_percentage' => $progress]);
        }
    }

    public function statistics(): JsonResponse
    {
        try {
            $totalProjects = Project::count();
            $activeProjects = Project::where('is_active', true)->count();
            $completedProjects = Project::whereHas('currentState', function ($q) {
                $q->where('slug', 'conectado-operando');
            })->count();

            $inProgressProjects = Project::whereHas('currentState', function ($q) {
                $q->whereNotIn('slug', ['conectado-operando', 'cancelado']);
            })->count();

            $projectsByState = Project::selectRaw('project_states.name, project_states.color, COUNT(projects.id) as count')
                ->join('project_states', 'projects.current_state_id', '=', 'project_states.id')
                ->groupBy('project_states.id', 'project_states.name', 'project_states.color')
                ->get();

            $projectsByDepartment = Project::selectRaw('department, COUNT(id) as count')
                ->groupBy('department')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'completed' => $completedProjects,
                    'in_progress' => $inProgressProjects,
                    'by_state' => $projectsByState,
                    'by_department' => $projectsByDepartment,
                ],
                'message' => 'Estadísticas de proyectos obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Asignar automáticamente centro de costos a un proyecto basado en el departamento
     */
    private function assignCostCenterToProject(Project $project): void
    {
        try {
            // Buscar centro de costos tipo "Proyecto" activo para el departamento del proyecto
            $costCenter = CostCenter::where('type', 'Proyecto')
                ->where('status', 'activo')
                ->where('name', 'like', '%' . $project->department . '%')
                ->first();

            // Si no se encuentra un centro específico para el departamento,
            // buscar cualquier centro de tipo Proyecto activo
            if (!$costCenter) {
                $costCenter = CostCenter::where('type', 'Proyecto')
                    ->where('status', 'activo')
                    ->first();
            }

            // Si se encontró un centro de costos, asignarlo al proyecto
            if ($costCenter) {
                $project->update(['cost_center_id' => $costCenter->cost_center_id]);

                \Log::info('Centro de costos asignado automáticamente', [
                    'project_id' => $project->id,
                    'project_code' => $project->code,
                    'cost_center_id' => $costCenter->cost_center_id,
                    'cost_center_name' => $costCenter->name,
                    'department' => $project->department
                ]);
            } else {
                \Log::warning('No se encontró centro de costos disponible para asignar al proyecto', [
                    'project_id' => $project->id,
                    'project_code' => $project->code,
                    'department' => $project->department
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error al asignar centro de costos automáticamente', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
