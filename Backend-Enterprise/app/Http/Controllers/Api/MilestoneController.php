<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MilestoneController extends Controller
{
    public function index(Request $request, string $projectId): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $query = Milestone::with(['type', 'documents', 'responsibleUser'])
                ->where('project_id', $projectId);

            // Apply filters
            if ($request->has('search') && $request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('responsible', 'like', '%' . $request->search . '%');
                });
            }

            // Filtrar por otros campos si es necesario, pero no por estado

            if ($request->has('type_id') && $request->type_id) {
                $query->where('type_id', $request->type_id);
            }

            $perPage = $request->get('per_page', 15);
            $milestones = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->paginate($perPage);

            // Transformar los hitos para incluir detalles de participantes
            $milestones->getCollection()->transform(function ($milestone) {
                $milestoneArray = $milestone->toArray();
                
                // Obtener los detalles de los participantes
                $participantsDetails = $milestone->getParticipantsWithDetailsAttribute();
                $milestoneArray['participant_users'] = $participantsDetails;
                
                return $milestoneArray;
            });

            return response()->json([
                'success' => true,
                'data' => $milestones,
                'message' => 'Hitos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los hitos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, string $projectId): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'type_id' => 'required|exists:milestone_types,id',
                'date' => 'required|date',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'responsible_user_id' => 'required|integer|exists:users,id',
                'participants' => 'nullable|array',
                'participants.*' => 'integer|exists:users,id',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate unique milestone code
            $lastMilestone = Milestone::orderBy('id', 'desc')->first();
            $nextId = $lastMilestone ? $lastMilestone->id + 1 : 1;
            $code = 'H-' . str_pad($projectId, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 2, '0', STR_PAD_LEFT);

            $milestoneData = $request->all();
            $milestoneData['code'] = $code;
            $milestoneData['project_id'] = $projectId;
            $milestoneData['created_by'] = auth()->id();
            $milestoneData['updated_by'] = auth()->id();

            $milestone = Milestone::create($milestoneData);

            // Manejar subida de documentos si se proporcionan
            if ($request->has('documents') && is_array($request->documents)) {
                foreach ($request->documents as $docData) {
                    if (isset($docData['file'])) {
                        // Procesar la subida del archivo
                        $file = $docData['file'];
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $fileName = \Illuminate\Support\Str::random(40) . '.' . $extension;
                        $filePath = 'projects/' . $projectId . '/milestones/' . $milestone->id . '/' . $fileName;

                        // Store the file
                        $file->storeAs('public/' . dirname($filePath), basename($filePath));

                        // Generate unique document code
                        $lastDocument = \App\Models\Document::orderBy('id', 'desc')->first();
                        $nextId = $lastDocument ? $lastDocument->id + 1 : 1;
                        $code = 'DOC-' . str_pad($milestone->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

                        $documentData = [
                            'code' => $code,
                            'name' => $docData['name'] ?? $originalName,
                            'original_name' => $originalName,
                            'path' => $filePath,
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                            'extension' => $extension,
                            'description' => $docData['description'] ?? '',
                            'type_id' => $docData['type_id'],
                            'responsible' => $docData['responsible'] ?? auth()->user()->name,
                            'project_id' => $projectId,
                            'milestone_id' => $milestone->id,
                            'is_public' => false,
                            'is_active' => true,
                            'created_by' => auth()->id(),
                            'updated_by' => auth()->id(),
                        ];

                        \App\Models\Document::create($documentData);
                    }
                }
            }

            // Recargar el hito para incluir los documentos recién creados
            $milestone->load(['type', 'documents', 'responsibleUser']);

            // Incluir los detalles de los participantes en la respuesta
            $milestoneArray = $milestone->toArray();
            $milestoneArray['participant_users'] = $milestone->getParticipantsWithDetailsAttribute();

            return response()->json([
                'success' => true,
                'data' => $milestoneArray,
                'message' => 'Hito creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el hito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $projectId, string $id): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $milestone = Milestone::with(['type', 'documents'])->where('project_id', $projectId)->find($id);

            if (!$milestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hito no encontrado'
                ], 404);
            }

            // Incluir los detalles de los participantes en la respuesta
            $milestoneArray = $milestone->toArray();
            $milestoneArray['participant_users'] = $milestone->getParticipantsWithDetailsAttribute();

            return response()->json([
                'success' => true,
                'data' => $milestoneArray,
                'message' => 'Hito obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el hito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $projectId, string $id): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $milestone = Milestone::where('project_id', $projectId)->find($id);

            if (!$milestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hito no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'type_id' => 'sometimes|required|exists:milestone_types,id',
                'date' => 'sometimes|required|date',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'responsible_user_id' => 'sometimes|required|integer|exists:users,id',
                'participants' => 'nullable|array',
                'participants.*' => 'integer|exists:users,id',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $milestoneData = $request->all();
            $milestoneData['updated_by'] = auth()->id();

            $milestone->update($milestoneData);

            // Manejar subida de documentos si se proporcionan
            if ($request->has('documents') && is_array($request->documents)) {
                foreach ($request->documents as $docData) {
                    if (isset($docData['file'])) {
                        // Procesar la subida del archivo
                        $file = $docData['file'];
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $fileName = \Illuminate\Support\Str::random(40) . '.' . $extension;
                        $filePath = 'projects/' . $projectId . '/milestones/' . $milestone->id . '/' . $fileName;

                        // Store the file
                        $file->storeAs('public/' . dirname($filePath), basename($filePath));

                        // Generate unique document code
                        $lastDocument = \App\Models\Document::orderBy('id', 'desc')->first();
                        $nextId = $lastDocument ? $lastDocument->id + 1 : 1;
                        $code = 'DOC-' . str_pad($milestone->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

                        $documentData = [
                            'code' => $code,
                            'name' => $docData['name'] ?? $originalName,
                            'original_name' => $originalName,
                            'path' => $filePath,
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                            'extension' => $extension,
                            'description' => $docData['description'] ?? '',
                            'type_id' => $docData['type_id'],
                            'responsible' => $docData['responsible'] ?? auth()->user()->name,
                            'project_id' => $projectId,
                            'milestone_id' => $milestone->id,
                            'is_public' => false,
                            'is_active' => true,
                            'created_by' => auth()->id(),
                            'updated_by' => auth()->id(),
                        ];

                        \App\Models\Document::create($documentData);
                    }
                }
            }

            // Recargar el hito para incluir los documentos recién creados
            $milestone->load(['type', 'documents', 'responsibleUser']);

            // Incluir los detalles de los participantes en la respuesta
            $milestoneArray = $milestone->toArray();
            $milestoneArray['participant_users'] = $milestone->getParticipantsWithDetailsAttribute();

            return response()->json([
                'success' => true,
                'data' => $milestoneArray,
                'message' => 'Hito actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el hito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $projectId, string $id): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $milestone = Milestone::where('project_id', $projectId)->find($id);

            if (!$milestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hito no encontrado'
                ], 404);
            }

            $milestone->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hito eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el hito',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function getTypes(): JsonResponse
    {
        try {
            $types = \App\Models\MilestoneType::active()->orderBy('name')->get();

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

    public function statistics(string $projectId): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $totalMilestones = $project->milestones()->count();

            $milestonesByType = $project->milestones()
                ->selectRaw('milestone_types.name, milestone_types.color, COUNT(milestones.id) as count')
                ->join('milestone_types', 'milestones.type_id', '=', 'milestone_types.id')
                ->groupBy('milestone_types.id', 'milestone_types.name', 'milestone_types.color')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalMilestones,
                    'by_type' => $milestonesByType,
                ],
                'message' => 'Estadísticas de hitos obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas de hitos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}