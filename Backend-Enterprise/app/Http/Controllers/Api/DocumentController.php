<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Project;
use App\Models\Milestone;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
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

            $query = Document::with(['type'])
                ->where('project_id', $projectId)
                ->whereNull('milestone_id'); // Only project-level documents, not milestone-specific

            // Apply filters
            if ($request->has('search') && $request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('responsible', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->has('type_id') && $request->type_id) {
                $query->where('type_id', $request->type_id);
            }

            $perPage = $request->get('per_page', 15);
            $documents = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documentos del proyecto obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function indexByMilestone(Request $request, string $projectId, string $milestoneId): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $milestone = Milestone::where('project_id', $projectId)->find($milestoneId);

            if (!$milestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hito no encontrado'
                ], 404);
            }

            $query = Document::with(['type'])
                ->where('milestone_id', $milestoneId);

            // Apply filters
            if ($request->has('search') && $request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('responsible', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->has('type_id') && $request->type_id) {
                $query->where('type_id', $request->type_id);
            }

            $perPage = $request->get('per_page', 15);
            $documents = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documentos del hito obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos del hito',
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
                'type_id' => 'required|exists:document_types,id',
                'responsible' => 'required|string|max:255',
                'date' => 'nullable|date',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif', // Max 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            
            // Generate unique filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::random(40) . '.' . $extension;
            $filePath = 'projects/' . $projectId . '/' . $fileName;

            // Store the file
            $file->storeAs('public/' . dirname($filePath), basename($filePath));

            // Generate unique document code
            $lastDocument = Document::orderBy('id', 'desc')->first();
            $nextId = $lastDocument ? $lastDocument->id + 1 : 1;
            $code = 'DOC-' . str_pad($projectId, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

            $documentData = [
                'code' => $code,
                'name' => $request->name,
                'original_name' => $originalName,
                'path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $extension,
                'description' => $request->description,
                'type_id' => $request->type_id,
                'responsible' => $request->responsible,
                'date' => $request->date,
                'project_id' => $projectId,
                'milestone_id' => null, // This is a project-level document
                'is_public' => false,
                'is_active' => true,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ];

            $document = Document::create($documentData);

            return response()->json([
                'success' => true,
                'data' => $document->load(['type']),
                'message' => 'Documento subido exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeForMilestone(Request $request, string $projectId, string $milestoneId): JsonResponse
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $milestone = Milestone::where('project_id', $projectId)->find($milestoneId);

            if (!$milestone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hito no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'type_id' => 'required|exists:document_types,id',
                'responsible' => 'required|string|max:255',
                'date' => 'nullable|date',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif', // Max 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            
            // Generate unique filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::random(40) . '.' . $extension;
            $filePath = 'projects/' . $projectId . '/milestones/' . $milestoneId . '/' . $fileName;

            // Store the file
            $file->storeAs('public/' . dirname($filePath), basename($filePath));

            // Generate unique document code
            $lastDocument = Document::orderBy('id', 'desc')->first();
            $nextId = $lastDocument ? $lastDocument->id + 1 : 1;
            $code = 'DOC-' . str_pad($milestoneId, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

            $documentData = [
                'code' => $code,
                'name' => $request->name,
                'original_name' => $originalName,
                'path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $extension,
                'description' => $request->description,
                'type_id' => $request->type_id,
                'responsible' => $request->responsible,
                'date' => $request->date,
                'project_id' => $projectId,
                'milestone_id' => $milestoneId,
                'is_public' => false,
                'is_active' => true,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ];

            $document = Document::create($documentData);

            return response()->json([
                'success' => true,
                'data' => $document->load(['type']),
                'message' => 'Documento subido al hito exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento al hito',
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

            $document = Document::with(['type'])->where('project_id', $projectId)->find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Documento no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Documento obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el documento',
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

            $document = Document::where('project_id', $projectId)->find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Documento no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'type_id' => 'sometimes|required|exists:document_types,id',
                'responsible' => 'sometimes|required|string|max:255',
                'date' => 'sometimes|nullable|date',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif', // Max 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $documentData = $request->except(['file']);

            // Handle file upload if provided
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                
                // Delete old file if exists
                if ($document->path && Storage::exists('public/' . $document->path)) {
                    Storage::delete('public/' . $document->path);
                }
                
                // Generate new filename
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileName = Str::random(40) . '.' . $extension;
                $filePath = 'projects/' . $projectId . '/' . $fileName;

                // Store the new file
                $file->storeAs('public/' . dirname($filePath), basename($filePath));

                $documentData['original_name'] = $originalName;
                $documentData['path'] = $filePath;
                $documentData['mime_type'] = $file->getMimeType();
                $documentData['size'] = $file->getSize();
                $documentData['extension'] = $extension;
            }

            $documentData['updated_by'] = auth()->id();

            $document->update($documentData);

            return response()->json([
                'success' => true,
                'data' => $document->load(['type']),
                'message' => 'Documento actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el documento',
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

            $document = Document::where('project_id', $projectId)->find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Documento no encontrado'
                ], 404);
            }

            // Delete file from storage
            if ($document->path && Storage::exists('public/' . $document->path)) {
                Storage::delete('public/' . $document->path);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function download(string $projectId, string $id): \Symfony\Component\HttpFoundation\Response
    {
        try {
            $project = Project::find($projectId);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $document = Document::where('project_id', $projectId)->find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Documento no encontrado'
                ], 404);
            }

            if (!Storage::exists('public/' . $document->path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo no encontrado'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $document->path);

            return response()->download($filePath, $document->original_name);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar el documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTypes(): JsonResponse
    {
        try {
            $types = \App\Models\DocumentType::active()->orderBy('name')->get();

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

            $totalDocuments = $project->documents()->count();
            $documentsByType = $project->documents()
                ->selectRaw('document_types.name, document_types.color, COUNT(documents.id) as count')
                ->join('document_types', 'documents.type_id', '=', 'document_types.id')
                ->groupBy('document_types.id', 'document_types.name', 'document_types.color')
                ->get();

            $totalSize = $project->documents()->sum('size');
            $totalSizeFormatted = $this->formatBytes($totalSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalDocuments,
                    'total_size' => $totalSize,
                    'total_size_formatted' => $totalSizeFormatted,
                    'by_type' => $documentsByType,
                ],
                'message' => 'Estadísticas de documentos obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas de documentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function multipleUpload(Request $request, string $projectId): JsonResponse
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
                'documents' => 'required|array|min:1|max:10', // Max 10 documents at once
                'documents.*.type_id' => 'required|exists:document_types,id',
                'documents.*.responsible' => 'required|string|max:255',
                'documents.*.date' => 'nullable|date',
                'documents.*.name' => 'required|string|max:255',
                'documents.*.description' => 'nullable|string',
                'documents.*.file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif', // Max 10MB each
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $uploadedDocuments = [];
            $errors = [];

            foreach ($request->documents as $docData) {
                try {
                    $file = $docData['file'];
                    
                    // Generate unique filename
                    $originalName = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension();
                    $fileName = Str::random(40) . '.' . $extension;
                    $filePath = 'projects/' . $projectId . '/' . $fileName;

                    // Store the file
                    $file->storeAs('public/' . dirname($filePath), basename($filePath));

                    // Generate unique document code
                    $lastDocument = Document::orderBy('id', 'desc')->first();
                    $nextId = $lastDocument ? $lastDocument->id + 1 : 1;
                    $code = 'DOC-' . str_pad($projectId, 3, '0', STR_PAD_LEFT) . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

                    $documentData = [
                        'code' => $code,
                        'name' => $docData['name'],
                        'original_name' => $originalName,
                        'path' => $filePath,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'extension' => $extension,
                        'description' => $docData['description'] ?? null,
                        'type_id' => $docData['type_id'],
                        'responsible' => $docData['responsible'],
                        'date' => $docData['date'] ?? null,
                        'project_id' => $projectId,
                        'milestone_id' => null, // This is a project-level document
                        'is_public' => false,
                        'is_active' => true,
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ];

                    $document = Document::create($documentData);
                    $uploadedDocuments[] = $document->load(['type']);
                } catch (\Exception $e) {
                    $errors[] = [
                        'name' => $docData['name'] ?? 'Unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            $response = [
                'success' => true,
                'data' => $uploadedDocuments,
                'message' => count($uploadedDocuments) . ' documentos subidos exitosamente'
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['message'] .= ' Con algunos errores.';
            }

            return response()->json($response, empty($errors) ? 201 : 207);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir múltiples documentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}