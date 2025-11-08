<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * Listar tareas con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            // Modificar la consulta para que los usuarios solo vean las tareas que tienen asignadas
            // o las que ellos mismos crearon
            $query = Task::with(['assignedBy', 'assignedUsers']);

            // Si el usuario no es administrador, gerente o ingeniero, solo puede ver tareas asignadas a él
            if (!$request->user()->hasRole('administrador') && 
                !$request->user()->hasRole('gerente') && 
                !$request->user()->hasRole('ingeniero')) {
                $query->where(function($q) use ($request) {
                    $q->where('assigned_by_user_id', $request->user()->id)
                      ->orWhereHas('assignedUsers', function($q) use ($request) {
                          $q->where('users.id', $request->user()->id);
                      });
                });
            }

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('assigned_by_user_id')) {
                $query->where('assigned_by_user_id', $request->assigned_by_user_id);
            }

            if ($request->filled('due_date_from')) {
                $query->where('due_date', '>=', $request->due_date_from);
            }

            if ($request->filled('due_date_to')) {
                $query->where('due_date', '<=', $request->due_date_to);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $tasks = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Task::count(),
                'pending' => Task::where('status', 'pending')->count(),
                'in_progress' => Task::where('status', 'in_progress')->count(),
                'completed' => Task::where('status', 'completed')->count(),
                'overdue' => Task::where('due_date', '<', now())
                                ->where('status', '!=', 'completed')
                                ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'tasks' => $tasks->items(),
                    'pagination' => [
                        'current_page' => $tasks->currentPage(),
                        'per_page' => $tasks->perPage(),
                        'total' => $tasks->total(),
                        'last_page' => $tasks->lastPage(),
                        'from' => $tasks->firstItem(),
                        'to' => $tasks->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Tareas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una tarea específica
     */
    public function show($id)
    {
        try {
            $task = Task::with(['assignedBy', 'assignedUsers', 'evidences'])->findOrFail($id);
            
            // Verificar si el usuario puede ver esta tarea
            $user = auth()->user();
            if ($user->hasRole('administrador') || 
                $user->hasRole('gerente') || 
                $user->hasRole('ingeniero') ||
                $task->assigned_by_user_id === $user->id ||
                $task->assignedUsers->contains($user->id)) {
                // Usuario autorizado para ver la tarea
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para ver esta tarea'
                ], 403);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'task' => $task
                ],
                'message' => 'Tarea obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tarea no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear una nueva tarea
     */
    public function store(Request $request)
    {
        try {
            // Verificar permisos: solo gerentes e ingenieros pueden crear tareas
            if (!$request->user()->hasRole('gerente') && !$request->user()->hasRole('ingeniero') && !$request->user()->hasRole('administrador')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para crear tareas'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'assigned_user_ids' => 'required|array|min:1', // Cambiado a assigned_user_ids
                'assigned_user_ids.*' => 'exists:users,id', // Validar cada ID de usuario
                'due_date' => 'nullable|date|after_or_equal:today',
            ], [
                'title.required' => 'El título es obligatorio',
                'assigned_user_ids.required' => 'Debes asignar la tarea al menos a un usuario',
                'assigned_user_ids.array' => 'Los usuarios asignados deben ser una lista',
                'assigned_user_ids.min' => 'Debes asignar la tarea al menos a un usuario',
                'assigned_user_ids.*.exists' => 'Uno o más de los usuarios seleccionados no existen',
                'due_date.after_or_equal' => 'La fecha límite debe ser hoy o una fecha futura',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $task = Task::create([
                'title' => $request->title,
                'description' => $request->description,
                'assigned_by_user_id' => $request->user()->id,
                'due_date' => $request->due_date,
            ]);

            // Asociar usuarios a la tarea
            $task->assignedUsers()->attach($request->assigned_user_ids);

            $task->load(['assignedBy', 'assignedUsers']);

            return response()->json([
                'success' => true,
                'data' => [
                    'task' => $task
                ],
                'message' => 'Tarea creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una tarea existente
     */
    public function update(Request $request, $id)
    {
        try {
            $task = Task::with('assignedUsers')->findOrFail($id);
            
            // Verificar permisos: solo el usuario que creó la tarea puede actualizarla
            if ($request->user()->id !== $task->assigned_by_user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para actualizar esta tarea'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'assigned_user_ids' => 'sometimes|required|array|min:1', // Cambiado a assigned_user_ids
                'assigned_user_ids.*' => 'exists:users,id', // Validar cada ID de usuario
                'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
                'due_date' => 'sometimes|required|date|after_or_equal:today',
            ], [
                'assigned_user_ids.*.exists' => 'Uno o más de los usuarios seleccionados no existen',
                'due_date.after_or_equal' => 'La fecha límite debe ser hoy o una fecha futura',
                'status.in' => 'El estado debe ser uno de: pending, in_progress, completed, cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['title', 'description', 'status', 'due_date']);
            $task->update($updateData);

            if ($request->status === 'completed') {
                $task->completed_at = now();
                $task->save();
            }

            // Actualizar usuarios asignados si se proporcionaron
            if ($request->has('assigned_user_ids')) {
                $task->assignedUsers()->sync($request->assigned_user_ids);
            }

            $task->load(['assignedBy', 'assignedUsers']);

            return response()->json([
                'success' => true,
                'data' => [
                    'task' => $task
                ],
                'message' => 'Tarea actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una tarea
     */
    public function destroy($id)
    {
        try {
            $task = Task::findOrFail($id);

            // Solo el usuario que creó la tarea puede eliminarla
            if (auth()->user()->id !== $task->assigned_by_user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar esta tarea'
                ], 403);
            }

            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tarea eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado de una tarea
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $task = Task::with('assignedUsers')->findOrFail($id);

            // Verificar permisos: el usuario puede actualizar el estado si creó la tarea o si está asignado a ella
            $user = $request->user();
            if ($user->id !== $task->assigned_by_user_id && !$task->assignedUsers->contains($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para actualizar esta tarea'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,in_progress,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            $task->status = $request->status;
            if ($request->status === 'completed') {
                $task->completed_at = now();
            } elseif ($request->status !== 'completed') {
                $task->completed_at = null;
            }
            $task->save();

            $task->load(['assignedBy', 'assignedUsers']);

            return response()->json([
                'success' => true,
                'data' => [
                    'task' => $task
                ],
                'message' => "Tarea {$request->status}"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado de tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener tareas asignadas al usuario actual
     */
    public function myTasks(Request $request)
    {
        try {
            $query = Task::with(['assignedBy', 'assignedUsers'])
                        ->whereHas('assignedUsers', function($q) use ($request) {
                            $q->where('users.id', $request->user()->id);
                        });

            // Filtros
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('due_date_from')) {
                $query->where('due_date', '>=', $request->due_date_from);
            }

            if ($request->filled('due_date_to')) {
                $query->where('due_date', '<=', $request->due_date_to);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $tasks = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'tasks' => $tasks->items(),
                    'pagination' => [
                        'current_page' => $tasks->currentPage(),
                        'per_page' => $tasks->perPage(),
                        'total' => $tasks->total(),
                        'last_page' => $tasks->lastPage(),
                        'from' => $tasks->firstItem(),
                        'to' => $tasks->lastItem(),
                    ],
                ],
                'message' => 'Tareas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de tareas
     */
    public function statistics()
    {
        try {
            $user = auth()->user();
            
            $stats = [
                'total_tasks' => Task::count(),
                'pending_tasks' => Task::where('status', 'pending')->count(),
                'in_progress_tasks' => Task::where('status', 'in_progress')->count(),
                'completed_tasks' => Task::where('status', 'completed')->count(),
                'overdue_tasks' => Task::where('due_date', '<', now())
                                     ->where('status', '!=', 'completed')
                                     ->count(),
                'my_tasks' => Task::whereHas('assignedUsers', function($q) use ($user) {
                                    $q->where('users.id', $user->id);
                                })->count(),
                'assigned_by_me' => Task::where('assigned_by_user_id', $user->id)->count(),
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