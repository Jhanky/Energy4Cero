<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MaintenanceController extends Controller
{
    /**
     * Listar mantenimientos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Maintenance::with(['project', 'createdBy']);

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

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->filled('project_id')) {
                $query->where('project_id', $request->project_id);
            }



            if ($request->filled('scheduled_date_from')) {
                $query->where('scheduled_date', '>=', $request->scheduled_date_from);
            }

            if ($request->filled('scheduled_date_to')) {
                $query->where('scheduled_date', '<=', $request->scheduled_date_to);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'scheduled_date');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $maintenances = $query->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Maintenance::count(),
                'scheduled' => Maintenance::where('status', 'scheduled')->count(),
                'in_progress' => Maintenance::where('status', 'in_progress')->count(),
                'completed' => Maintenance::where('status', 'completed')->count(),
                'cancelled' => Maintenance::where('status', 'cancelled')->count(),
                'overdue' => Maintenance::where('scheduled_date', '<', now())
                               ->where('status', 'scheduled')
                               ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenances' => $maintenances->items(),
                    'pagination' => [
                        'current_page' => $maintenances->currentPage(),
                        'per_page' => $maintenances->perPage(),
                        'total' => $maintenances->total(),
                        'last_page' => $maintenances->lastPage(),
                        'from' => $maintenances->firstItem(),
                        'to' => $maintenances->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Mantenimientos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mantenimientos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener mantenimientos para calendario
     */
    public function calendar(Request $request)
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

            $maintenances = Maintenance::with(['project'])
                ->byDateRange($startDate, $endDate)
                ->get()
                ->map(function ($maintenance) {
                    return [
                        'id' => $maintenance->maintenance_id,
                        'title' => $maintenance->title,
                        'description' => $maintenance->description,
                        'start' => $maintenance->scheduled_date->format('Y-m-d'),
                        'end' => $maintenance->scheduled_date->format('Y-m-d'),
                        'status' => $maintenance->status,
                        'priority' => $maintenance->priority,
                        'type' => $maintenance->type,
                        'project' => $maintenance->project ? [
                            'id' => $maintenance->project->id,
                            'name' => $maintenance->project->name ?? 'Sin nombre'
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenances' => $maintenances,
                    'date_range' => [
                        'start' => $startDate,
                        'end' => $endDate
                    ]
                ],
                'message' => 'Mantenimientos de calendario obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mantenimientos de calendario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un mantenimiento específico
     */
    public function show($id)
    {
        try {
            $maintenance = Maintenance::with([
                'project' => function($query) {
                    $query->with([
                        'client',
                        'quotation.usedProducts'
                    ]);
                },
                'createdBy',
                'evidences'
            ])->findOrFail($id);

            // Cargar información de participantes si existen
            $participantUsers = [];
            if ($maintenance->participants && is_array($maintenance->participants) && !empty($maintenance->participants)) {
                $participantUsers = User::whereIn('id', $maintenance->participants)
                    ->select('id', 'name', 'email', 'position')
                    ->get()
                    ->map(function($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'position' => $user->position,
                        ];
                    });
            }

            // Agregar información adicional del proyecto si existe
            if ($maintenance->project) {
                $project = $maintenance->project;

                // Información del cliente
                $clientInfo = null;
                if ($project->client) {
                    $clientInfo = [
                        'name' => $project->client->name,
                        'email' => $project->client->email,
                        'phone' => $project->client->phone,
                        'address' => $project->client->address,
                        'department' => $project->client->department?->name,
                        'city' => $project->client->city?->name,
                    ];
                }

                // Información de equipos instalados
                $installedEquipment = [];
                if ($project->quotation && $project->quotation->usedProducts) {
                    $installedEquipment = $project->quotation->usedProducts->map(function($product) {
                        // Obtener información adicional de potencia/capacidad según el tipo
                        $powerInfo = null;
                        $capacityInfo = null;

                        switch ($product->product_type) {
                            case 'panel':
                                $panel = \App\Models\Panel::find($product->product_id);
                                if ($panel) {
                                    $powerInfo = $panel->power_output . ' W';
                                }
                                break;
                            case 'inverter':
                                $inverter = \App\Models\Inverter::find($product->product_id);
                                if ($inverter) {
                                    $powerInfo = $inverter->power_output_kw . ' kW';
                                }
                                break;
                            case 'battery':
                                $battery = \App\Models\Battery::find($product->product_id);
                                if ($battery) {
                                    $capacityInfo = $battery->ah_capacity . ' Ah / ' . $battery->voltage . ' V';
                                }
                                break;
                        }

                        return [
                            'type' => $product->product_type,
                            'brand' => $product->brand,
                            'model' => $product->model,
                            'quantity' => $product->quantity,
                            'power_info' => $powerInfo,
                            'capacity_info' => $capacityInfo,
                        ];
                    })->groupBy('type')->map(function($products, $type) {
                        return [
                            'type' => $type,
                            'items' => $products->map(function($product) {
                                return [
                                    'brand' => $product['brand'],
                                    'model' => $product['model'],
                                    'quantity' => $product['quantity'],
                                    'power_info' => $product['power_info'],
                                    'capacity_info' => $product['capacity_info'],
                                ];
                            })->toArray()
                        ];
                    })->values()->toArray();
                }

                // Potencia instalada
                $installedPower = [
                    'dc_kw' => $project->capacity_dc,
                    'ac_kw' => $project->capacity_ac,
                    'nominal_power' => $project->nominal_power,
                    'total_panels' => $project->number_panels,
                    'total_inverters' => $project->number_inverters,
                ];

                // Agregar información adicional al proyecto
                $maintenance->project->additional_info = [
                    'client' => $clientInfo,
                    'installed_equipment' => $installedEquipment,
                    'installed_power' => $installedPower,
                ];
            }

            // Agregar participantes a la respuesta
            $maintenanceArray = $maintenance->toArray();
            $maintenanceArray['participant_users'] = $participantUsers;

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenance' => $maintenanceArray
                ],
                'message' => 'Mantenimiento obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo mantenimiento
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|in:preventive,corrective,predictive,condition_based',
                'priority' => 'required|in:low,medium,high,critical',
                'scheduled_date' => 'required|date|after_or_equal:today',
                'project_id' => 'nullable|exists:projects,id',
                'participants' => 'nullable|array',
                'participants.*' => 'integer|exists:users,id',
                'notes' => 'nullable|string',
            ], [
                'title.required' => 'El título es obligatorio',
                'type.required' => 'El tipo de mantenimiento es obligatorio',
                'type.in' => 'El tipo debe ser uno de: preventive, corrective, predictive, condition_based',
                'priority.required' => 'La prioridad es obligatoria',
                'priority.in' => 'La prioridad debe ser: low, medium, high, critical',
                'scheduled_date.required' => 'La fecha programada es obligatoria',
                'scheduled_date.after_or_equal' => 'La fecha programada debe ser hoy o futura',
                'project_id.exists' => 'El proyecto seleccionado no existe',
                'participants.array' => 'Los participantes deben ser un array',
                'participants.*.integer' => 'Los IDs de participantes deben ser números enteros',
                'participants.*.exists' => 'Uno o más participantes no existen',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maintenance = Maintenance::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'priority' => $request->priority,
                'scheduled_date' => $request->scheduled_date,
                'project_id' => $request->project_id,
                'created_by_user_id' => $request->user()->id,
                'participants' => $request->participants,
                'notes' => $request->notes,
            ]);

            $maintenance->load(['project', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenance' => $maintenance
                ],
                'message' => 'Mantenimiento creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear mantenimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un mantenimiento existente
     */
    public function update(Request $request, $id)
    {
        try {
            $maintenance = Maintenance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|required|in:preventive,corrective,predictive,condition_based',
                'priority' => 'sometimes|required|in:low,medium,high,critical',
                'status' => 'sometimes|required|in:scheduled,in_progress,completed,cancelled,overdue',
                'scheduled_date' => 'sometimes|required|date',
                'project_id' => 'nullable|exists:projects,id',
                'participants' => 'nullable|array',
                'participants.*' => 'integer|exists:users,id',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'title', 'description', 'type', 'priority', 'status',
                'scheduled_date', 'project_id', 'participants',
                'notes'
            ]);

            $maintenance->update($updateData);

            // Si se completó el mantenimiento, actualizar fecha de último completado
            if ($request->status === 'completed') {
                $maintenance->last_completed_date = now();
                $maintenance->save();
            }

            $maintenance->load(['project', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenance' => $maintenance
                ],
                'message' => 'Mantenimiento actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar mantenimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un mantenimiento
     */
    public function destroy($id)
    {
        try {
            $maintenance = Maintenance::findOrFail($id);
            $maintenance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mantenimiento eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar mantenimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado de un mantenimiento
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $maintenance = Maintenance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:scheduled,in_progress,completed,cancelled,overdue',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maintenance->status = $request->status;

            if ($request->status === 'completed') {
                $maintenance->last_completed_date = now();
            }

            $maintenance->save();

            $maintenance->load(['project', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => [
                    'maintenance' => $maintenance
                ],
                'message' => "Mantenimiento {$request->status}"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado de mantenimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de mantenimientos
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_maintenances' => Maintenance::count(),
                'scheduled_maintenances' => Maintenance::where('status', 'scheduled')->count(),
                'in_progress_maintenances' => Maintenance::where('status', 'in_progress')->count(),
                'completed_maintenances' => Maintenance::where('status', 'completed')->count(),
                'cancelled_maintenances' => Maintenance::where('status', 'cancelled')->count(),
                'overdue_maintenances' => Maintenance::where('scheduled_date', '<', now())
                                       ->where('status', 'scheduled')
                                       ->count(),
                'preventive_maintenances' => Maintenance::where('type', 'preventive')->count(),
                'corrective_maintenances' => Maintenance::where('type', 'corrective')->count(),
                'high_priority_maintenances' => Maintenance::where('priority', 'high')->count(),
                'critical_priority_maintenances' => Maintenance::where('priority', 'critical')->count(),
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
