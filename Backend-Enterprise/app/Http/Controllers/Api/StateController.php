<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectState;
use App\Models\MilestoneType;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class StateController extends Controller
{
    public function getProjectStates(Request $request): JsonResponse
    {
        try {
            $query = ProjectState::query();

            if ($request->has('active') && $request->active !== null) {
                $query->where('is_active', $request->active);
            }

            $perPage = $request->get('per_page', 15);
            $states = $query->ordered()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $states,
                'message' => 'Estados de proyecto obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los estados de proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProjectState(string $id): JsonResponse
    {
        try {
            $state = ProjectState::find($id);

            if (!$state) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de proyecto no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $state,
                'message' => 'Estado de proyecto obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el estado de proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createProjectState(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:project_states,name',
                'slug' => 'required|string|max:255|unique:project_states,slug',
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:7',
                'estimated_duration' => 'nullable|integer|min:0',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $state = ProjectState::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $state,
                'message' => 'Estado de proyecto creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el estado de proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProjectState(Request $request, string $id): JsonResponse
    {
        try {
            $state = ProjectState::find($id);

            if (!$state) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:project_states,name,' . $id,
                'slug' => 'sometimes|required|string|max:255|unique:project_states,slug,' . $id,
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:7',
                'estimated_duration' => 'nullable|integer|min:0',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $state->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $state,
                'message' => 'Estado de proyecto actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado de proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteProjectState(string $id): JsonResponse
    {
        try {
            $state = ProjectState::find($id);

            if (!$state) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de proyecto no encontrado'
                ], 404);
            }

            // Check if the state is being used by any project
            if ($state->projects()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el estado porque está siendo usado por uno o más proyectos'
                ], 400);
            }

            $state->delete();

            return response()->json([
                'success' => true,
                'message' => 'Estado de proyecto eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el estado de proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMilestoneTypes(Request $request): JsonResponse
    {
        try {
            $query = MilestoneType::query();

            if ($request->has('active') && $request->active !== null) {
                $query->where('is_active', $request->active);
            }

            $perPage = $request->get('per_page', 15);
            $types = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $types,
                'message' => 'Tipos de hitos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de hitos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDocumentTypes(Request $request): JsonResponse
    {
        try {
            $query = DocumentType::query();

            if ($request->has('active') && $request->active !== null) {
                $query->where('is_active', $request->active);
            }

            $perPage = $request->get('per_page', 15);
            $types = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $types,
                'message' => 'Tipos de documentos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de documentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProjectStateTimeline(string $projectId): JsonResponse
    {
        try {
            $project = \App\Models\Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Obtener el historial de cambios de estado
            $stateHistory = $project->stateHistory()
                ->with(['fromState', 'toState', 'user'])
                ->orderBy('changed_at', 'asc')
                ->get();

            $timeline = [];

            // Recopilar todos los estados que han sido alcanzados
            $reachedStateIds = collect();
            foreach ($stateHistory as $history) {
                $reachedStateIds->push($history->from_state_id);
                $reachedStateIds->push($history->to_state_id);
            }
            $reachedStateIds = $reachedStateIds->unique();

            // Si no hay historial pero el proyecto tiene un estado actual
            if ($reachedStateIds->isEmpty() && $project->current_state_id) {
                $currentState = \App\Models\ProjectState::find($project->current_state_id);
                if ($currentState) {
                    $timeline[] = [
                        'state_id' => $currentState->id,
                        'state_name' => $currentState->name,
                        'user_name' => $project->current_responsible ?: 'Sistema',
                        'start_date' => $project->created_at,
                        'end_date' => null,
                        'reason' => null,
                    ];
                }
            } else {
                // Procesar cada estado alcanzado
                foreach ($reachedStateIds as $stateId) {
                    $state = \App\Models\ProjectState::find($stateId);
                    if (!$state) continue;

                    // Encontrar la transición de entrada (cuando se entró al estado)
                    $entryTransition = $stateHistory->firstWhere('to_state_id', $stateId);

                    // Encontrar la transición de salida (cuando se salió del estado)
                    $exitTransition = $stateHistory->firstWhere('from_state_id', $stateId);

                    $startDate = null;
                    $endDate = null;
                    $userName = null;
                    $reason = null;

                    if ($entryTransition) {
                        $startDate = $entryTransition->changed_at;
                        $userName = $entryTransition->user ? $entryTransition->user->name : 'Sistema';
                        $reason = $entryTransition->reason;
                    }

                    if ($exitTransition) {
                        $endDate = $exitTransition->changed_at;
                    } elseif ($project->current_state_id == $stateId) {
                        // Estado actual, no tiene fecha de fin
                        $endDate = null;
                        // Si no hay transición de entrada pero es el estado actual, usar fecha de creación
                        if (!$entryTransition) {
                            $startDate = $project->created_at;
                            $userName = $project->current_responsible ?: 'Sistema';
                        }
                    }

                    $timeline[] = [
                        'state_id' => $state->id,
                        'state_name' => $state->name,
                        'user_name' => $userName,
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'reason' => $reason,
                    ];
                }
            }

            // Ordenar la línea de tiempo por fecha de inicio
            $timeline = collect($timeline)->sortBy('start_date')->values()->all();

            return response()->json([
                'success' => true,
                'data' => $timeline,
                'message' => 'Línea de tiempo de estados obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la línea de tiempo de estados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvailableStateTransitions(string $projectId, string $currentStateId): JsonResponse
    {
        try {
            $project = \App\Models\Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // In a real implementation, you would have a state transition matrix
            // For now, we'll allow all states except the current one
            $allStates = ProjectState::active()->orderBy('order')->get();
            $availableStates = $allStates->filter(function ($state) use ($currentStateId) {
                return $state->id != $currentStateId;
            });

            return response()->json([
                'success' => true,
                'data' => $availableStates,
                'message' => 'Transiciones de estado disponibles obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las transiciones de estado disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validateStateTransition(Request $request, string $projectId): JsonResponse
    {
        try {
            $project = \App\Models\Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'from_state_id' => 'required|exists:project_states,id',
                'to_state_id' => 'required|exists:project_states,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // In a real implementation, you would validate the state transition
            // using business rules or a state transition matrix
            $isValid = $request->from_state_id != $request->to_state_id;

            return response()->json([
                'success' => true,
                'data' => [
                    'is_valid' => $isValid,
                    'from_state' => $request->from_state_id,
                    'to_state' => $request->to_state_id,
                ],
                'message' => $isValid ? 'Transición de estado válida' : 'Transición de estado no válida'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al validar la transición de estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statistics(): JsonResponse
    {
        try {
            $totalProjectStates = ProjectState::count();
            $activeProjectStates = ProjectState::where('is_active', true)->count();
            
            $totalMilestoneTypes = MilestoneType::count();
            $activeMilestoneTypes = MilestoneType::where('is_active', true)->count();
            
            $totalDocumentTypes = DocumentType::count();
            $activeDocumentTypes = DocumentType::where('is_active', true)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'project_states' => [
                        'total' => $totalProjectStates,
                        'active' => $activeProjectStates,
                    ],
                    'milestone_types' => [
                        'total' => $totalMilestoneTypes,
                        'active' => $activeMilestoneTypes,
                    ],
                    'document_types' => [
                        'total' => $totalDocumentTypes,
                        'active' => $activeDocumentTypes,
                    ],
                ],
                'message' => 'Estadísticas de estados y tipos obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
