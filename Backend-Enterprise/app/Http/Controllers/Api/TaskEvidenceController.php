<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskEvidence;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TaskEvidenceController extends Controller
{
    /**
     * Subir evidencia fotográfica para una tarea
     */
    public function store(Request $request, $taskId)
    {
        try {
            $task = Task::findOrFail($taskId);

            // Verificar permisos: solo el usuario asignado o el que creó la tarea pueden subir evidencia
            if ($request->user()->id !== $task->assigned_by_user_id && $request->user()->id !== $task->assigned_to_user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para subir evidencia a esta tarea'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Máximo 10MB
            ], [
                'file.required' => 'El archivo de imagen es obligatorio',
                'file.image' => 'El archivo debe ser una imagen',
                'file.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp',
                'file.max' => 'La imagen no debe superar los 10MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo inválido'
                ], 422);
            }

            $file = $request->file('file');
            
            // Crear directorio si no existe
            $directory = 'task_evidences/' . $taskId;
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            // Guardar archivo
            $filename = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs($directory, $filename, 'public');

            $evidence = TaskEvidence::create([
                'task_id' => $taskId,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'evidence' => $evidence
                ],
                'message' => 'Evidencia subida exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir evidencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las evidencias de una tarea
     */
    public function index($taskId)
    {
        try {
            $task = Task::findOrFail($taskId);
            
            $evidences = $task->evidences()->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'evidences' => $evidences
                ],
                'message' => 'Evidencias obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evidencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una evidencia específica
     */
    public function show($taskId, $evidenceId)
    {
        try {
            $evidence = TaskEvidence::where('task_id', $taskId)->findOrFail($evidenceId);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'evidence' => $evidence
                ],
                'message' => 'Evidencia obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Evidencia no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Eliminar una evidencia
     */
    public function destroy(Request $request, $taskId, $evidenceId)
    {
        try {
            $evidence = TaskEvidence::where('task_id', $taskId)->findOrFail($evidenceId);

            // Verificar permisos: solo el usuario que subió la evidencia o el creador/asignado de la tarea pueden eliminarla
            $task = $evidence->task;
            if ($request->user()->id !== $task->assigned_by_user_id && $request->user()->id !== $task->assigned_to_user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar esta evidencia'
                ], 403);
            }

            // Eliminar archivo físico
            if (Storage::disk('public')->exists($evidence->file_path)) {
                Storage::disk('public')->delete($evidence->file_path);
            }

            $evidence->delete();

            return response()->json([
                'success' => true,
                'message' => 'Evidencia eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar evidencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener URL para descargar la imagen de evidencia
     */
    public function getFileUrl($evidenceId)
    {
        try {
            $evidence = TaskEvidence::findOrFail($evidenceId);
            
            $url = Storage::disk('public')->url($evidence->file_path);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'url' => asset($url)
                ],
                'message' => 'URL obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}