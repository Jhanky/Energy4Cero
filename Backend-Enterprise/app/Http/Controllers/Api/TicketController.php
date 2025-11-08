<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketComment;
use App\Models\TicketType;
use App\Models\TicketPriority;
use App\Models\TicketState;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Ticket::select([
                    'id',
                    'ticket_code',
                    'title',
                    'description',
                    'type_id',
                    'priority_id', 
                    'status_id',
                    'assigned_to',
                    'created_by',
                    'client_id',
                    'project_id',
                    'created_at',
                    'updated_at'
                ])
                ->with([
                    'client:client_id,name',
                    'ticketPriority:id,name,color,sla_hours',
                    'ticketState:id,name,color,active',
                    'assignedTo:id,name,email,position',
                    'ticketType:id,name,description,color',
                    'project:id,name,code,client_id'
                ]);

            // Filtros
            if ($request->has('project_id')) {
                $query->where('project_id', $request->project_id);
            }

            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            if ($request->has('type_id')) {
                $query->where('type_id', $request->type_id);
            }

            if ($request->has('priority_id')) {
                $query->where('priority_id', $request->priority_id);
            }

            if ($request->has('status_id')) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('ticket_code', 'LIKE', "%{$search}%");
                });
            }

            // Ordenamiento
            $orderBy = $request->get('sort_by', 'created_at');
            $orderDir = $request->get('sort_dir', 'desc');

            $query->orderBy($orderBy, $orderDir);

            $perPage = $request->get('per_page', 15);
            $tickets = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $tickets,
                'message' => 'Tickets obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tickets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validación de los datos
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'client_id' => 'required|exists:clients,client_id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'type_id' => 'required|exists:ticket_types,id',
                'priority_id' => 'required|exists:ticket_priorities,id',
                'status_id' => 'required|exists:ticket_states,id',
                'assigned_to' => 'nullable|exists:users,id',
                'due_date' => 'nullable|date|after_or_equal:today',
                'archivos.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp|max:10240' // Máx. 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear el ticket
            $ticket = new Ticket();
            $ticket->fill($validator->validated());
            $ticket->created_by = Auth::id();
            $ticket->save();

            // Procesar archivos adjuntos si existen
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $index => $file) {
                    if ($file->isValid()) {
                        // Validar tamaño y tipo
                        $mimeType = $file->getMimeType();
                        
                        // Crear nombre único para el archivo
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $storedName = 'ticket_attachment_' . $ticket->id . '_' . time() . '_' . $index . '.' . $extension;
                        
                        // Guardar archivo en storage
                        $path = $file->storeAs('tickets/' . $ticket->id, $storedName, 'public');
                        
                        // Crear registro de archivo adjunto
                        $ticketAttachment = new TicketAttachment();
                        $ticketAttachment->ticket_id = $ticket->id;
                        $ticketAttachment->original_name = $originalName;
                        $ticketAttachment->stored_name = $storedName;
                        $ticketAttachment->file_path = $path;
                        $ticketAttachment->mime_type = $mimeType;
                        $ticketAttachment->file_size = $file->getSize();
                        $ticketAttachment->file_type = $this->getFileTypeFromMimeType($mimeType);
                        $ticketAttachment->uploaded_by = Auth::id();
                        $ticketAttachment->save();
                    }
                }
            }

            // Cargar relaciones para respuesta
            $ticket->load(['project', 'client', 'assignedTo', 'createdBy', 'ticketType', 'ticketPriority', 'ticketState', 'attachments']);

            return response()->json([
                'success' => true,
                'data' => $ticket,
                'message' => 'Ticket creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $ticket = Ticket::with([
                'project:id,code,name,description',
                'client',
                'assignedTo',
                'createdBy',
                'ticketType',
                'ticketPriority',
                'ticketState',
                'attachments',
                'comments.user' // Cargar también el usuario que comentó
            ])->find($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $ticket,
                'message' => 'Ticket obtenido exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $ticket = Ticket::find($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            // Validación de los datos
            $validator = Validator::make($request->all(), [
                'project_id' => 'sometimes|required|exists:projects,id',
                'client_id' => 'sometimes|required|exists:clients,client_id',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'type_id' => 'sometimes|required|exists:ticket_types,id',
                'priority_id' => 'sometimes|required|exists:ticket_priorities,id',
                'status_id' => 'sometimes|required|exists:ticket_states,id',
                'assigned_to' => 'sometimes|nullable|exists:users,id',
                'due_date' => 'sometimes|nullable|date|after_or_equal:today',
                'archivos.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp|max:10240' // Máx. 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar el ticket
            $ticket->update($validator->validated());

            // Procesar archivos adjuntos si existen
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $index => $file) {
                    if ($file->isValid()) {
                        // Validar tamaño y tipo
                        $mimeType = $file->getMimeType();
                        
                        // Crear nombre único para el archivo
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $storedName = 'ticket_attachment_' . $ticket->id . '_' . time() . '_' . $index . '.' . $extension;
                        
                        // Guardar archivo en storage
                        $path = $file->storeAs('tickets/' . $ticket->id, $storedName, 'public');
                        
                        // Crear registro de archivo adjunto
                        $ticketAttachment = new TicketAttachment();
                        $ticketAttachment->ticket_id = $ticket->id;
                        $ticketAttachment->original_name = $originalName;
                        $ticketAttachment->stored_name = $storedName;
                        $ticketAttachment->file_path = $path;
                        $ticketAttachment->mime_type = $mimeType;
                        $ticketAttachment->file_size = $file->getSize();
                        $ticketAttachment->file_type = $this->getFileTypeFromMimeType($mimeType);
                        $ticketAttachment->uploaded_by = Auth::id();
                        $ticketAttachment->save();
                    }
                }
            }

            // Cargar relaciones para respuesta
            $ticket->load(['project', 'client', 'assignedTo', 'createdBy', 'ticketType', 'ticketPriority', 'ticketState', 'attachments']);

            return response()->json([
                'success' => true,
                'data' => $ticket,
                'message' => 'Ticket actualizado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $ticket = Ticket::find($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            // Eliminar archivo adjuntos físicamente
            $attachments = $ticket->attachments;
            foreach ($attachments as $attachment) {
                if (Storage::disk('public')->exists($attachment->file_path)) {
                    Storage::disk('public')->delete($attachment->file_path);
                }
                $attachment->delete();
            }

            // Eliminar comentarios
            $ticket->comments()->delete();

            $ticket->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ticket status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status_id' => 'required|exists:ticket_states,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ticket = Ticket::find($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            $ticket->status_id = $request->status_id;
            $ticket->save();

            $ticket->load(['ticketState']);

            return response()->json([
                'success' => true,
                'data' => $ticket,
                'message' => 'Estado del ticket actualizado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add comment to ticket
     */
    public function addComment(Request $request, $ticketId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'comment' => 'required|string|min:1|max:1000',
                'is_internal' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ticket = Ticket::find($ticketId);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            $comment = new TicketComment();
            $comment->ticket_id = $ticketId;
            $comment->user_id = Auth::id();
            $comment->comment = $request->comment;
            $comment->is_internal = $request->is_internal ?? false;
            $comment->save();

            $comment->load('user');

            return response()->json([
                'success' => true,
                'data' => $comment,
                'message' => 'Comentario agregado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar comentario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comments for a ticket
     */
    public function getComments($ticketId)
    {
        try {
            $ticket = Ticket::find($ticketId);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            $comments = TicketComment::with('user')
                ->where('ticket_id', $ticketId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $comments,
                'message' => 'Comentarios obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener comentarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Attach files to existing ticket
     */
    public function attachFiles(Request $request, $ticketId)
    {
        try {
            $ticket = Ticket::find($ticketId);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'archivos.*' => 'required|file|mimes:pdf,jpg,jpeg,png,gif,webp|max:10240' // Máx. 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $attachments = [];

            // Procesar archivos adjuntos
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $index => $file) {
                    if ($file->isValid()) {
                        // Validar tamaño y tipo
                        $mimeType = $file->getMimeType();
                        
                        // Crear nombre único para el archivo
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $storedName = 'ticket_attachment_' . $ticketId . '_' . time() . '_' . $index . '.' . $extension;
                        
                        // Guardar archivo en storage
                        $path = $file->storeAs('tickets/' . $ticketId, $storedName, 'public');
                        
                        // Crear registro de archivo adjunto
                        $ticketAttachment = new TicketAttachment();
                        $ticketAttachment->ticket_id = $ticketId;
                        $ticketAttachment->original_name = $originalName;
                        $ticketAttachment->stored_name = $storedName;
                        $ticketAttachment->file_path = $path;
                        $ticketAttachment->mime_type = $mimeType;
                        $ticketAttachment->file_size = $file->getSize();
                        $ticketAttachment->file_type = $this->getFileTypeFromMimeType($mimeType);
                        $ticketAttachment->uploaded_by = Auth::id();
                        $ticketAttachment->save();
                        
                        $ticketAttachment->load('uploadedBy'); // Cargar relación para respuesta
                        $attachments[] = $ticketAttachment;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $attachments,
                'message' => count($attachments) > 0 
                    ? 'Archivos adjuntos exitosamente' 
                    : 'No se adjuntaron archivos'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al adjuntar archivos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove attachment from ticket
     */
    public function removeAttachment($ticketId, $attachmentId)
    {
        try {
            $attachment = TicketAttachment::where('ticket_id', $ticketId)
                ->where('id', $attachmentId)
                ->first();

            if (!$attachment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo adjunto no encontrado o no pertenece al ticket'
                ], 404);
            }

            // Eliminar archivo físico
            if (Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            $attachment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Archivo adjunto eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar archivo adjunto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download attachment
     */
    public function downloadAttachment($ticketId, $attachmentId)
    {
        try {
            $attachment = TicketAttachment::where('ticket_id', $ticketId)
                ->where('id', $attachmentId)
                ->first();

            if (!$attachment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo adjunto no encontrado o no pertenece al ticket'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $attachment->file_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo no encontrado en el servidor'
                ], 404);
            }

            return response()->download($filePath, $attachment->original_name);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar archivo adjunto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ticket statistics
     */
    public function statistics()
    {
        try {
            $totalTickets = Ticket::count();
            $openTickets = Ticket::whereHas('ticketState', function($query) {
                $query->where('is_closed', false);
            })->count();
            $closedTickets = Ticket::whereHas('ticketState', function($query) {
                $query->where('is_closed', true);
            })->count();
            $pendingTickets = Ticket::whereHas('ticketState', function($query) {
                $query->where('name', 'LIKE', '%pendiente%');
            })->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalTickets,
                    'open' => $openTickets,
                    'closed' => $closedTickets,
                    'pending' => $pendingTickets
                ],
                'message' => 'Estadísticas de tickets obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de tickets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper methods
     */

    private function getFileTypeFromMimeType($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'imagen';
        } elseif ($mimeType === 'application/pdf') {
            return 'documento';
        } elseif (str_contains($mimeType, 'word')) {
            return 'documento';
        } elseif (str_contains($mimeType, 'excel') || str_contains($mimeType, 'spreadsheet')) {
            return 'hoja_calculo';
        } elseif (str_contains($mimeType, 'powerpoint') || str_contains($mimeType, 'presentation')) {
            return 'presentacion';
        } elseif (str_contains($mimeType, 'archive') || str_contains($mimeType, 'zip') || str_contains($mimeType, 'compressed')) {
            return 'archivo_comprimido';
        } else {
            return 'otros';
        }
    }
}
