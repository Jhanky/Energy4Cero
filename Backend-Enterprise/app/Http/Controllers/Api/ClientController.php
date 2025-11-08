<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Arr;

class ClientController extends Controller
{
    /**
     * Check if an array is a list (indexed array with sequential numeric keys)
     */
    private function isArrayAList($array)
    {
        if (!is_array($array)) {
            return false;
        }
        
        return Arr::isList($array);
    }
    
    /**
     * Listar clientes con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Client::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->search($search);
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }


            if ($request->filled('client_type')) {
                $query->where('client_type', $request->client_type);
            }

            // Ordenamiento - por defecto por fecha de creación descendente (más recientes primero)
            $sortBy = $request->get('sort_by', 'client_id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación con relaciones
            $perPage = $request->get('per_page', 15);
            $clients = $query->with(['responsibleUser', 'department', 'city'])->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Client::count(),
                'active' => Client::where('is_active', true)->count(),
                'inactive' => Client::where('is_active', false)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'clients' => $clients->items(),
                    'pagination' => [
                        'current_page' => $clients->currentPage(),
                        'per_page' => $clients->perPage(),
                        'total' => $clients->total(),
                        'last_page' => $clients->lastPage(),
                        'from' => $clients->firstItem(),
                        'to' => $clients->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Clientes obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un cliente específico
     */
    public function show($id)
    {
        try {
            $client = Client::with(['responsibleUser', 'department', 'city'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client
                ],
                'message' => 'Cliente obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo cliente
     */
    public function store(Request $request)
    {
        try {
            $requestData = $request->all();
            
            // Validar que los datos sean un objeto y no un array
            if (!is_array($requestData) || $this->isArrayAList($requestData)) {
                \Log::error('Error: Se recibió un array en lugar de un objeto para la creación del cliente');
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de datos incorrecto. Se esperaba un objeto JSON con las propiedades del cliente.',
                    'errors' => ['format' => ['Se esperaba un objeto JSON con las propiedades del cliente, no un array']]
                ], 422);
            }
            
            \Log::info('Datos recibidos para crear cliente:', $requestData);
            
            $validator = Validator::make($requestData, [
                'name' => 'required|string|max:255',
                'client_type' => 'required|string|in:residencial,comercial,empresa',
                'email' => 'required|email|unique:clients,email,NULL,client_id',
                'phone' => 'nullable|string|max:20',
                'nic' => 'nullable|string|max:50|unique:clients,nic,NULL,client_id',
                'responsible_user_id' => 'nullable|exists:users,id',
                'department_id' => 'nullable|exists:departments,department_id',
                'city_id' => 'nullable|exists:cities,city_id',
                'address' => 'nullable|string|max:500',
                'monthly_consumption' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'client_type.required' => 'El tipo de cliente es obligatorio',
                'client_type.in' => 'El tipo de cliente debe ser residencial, comercial o empresa',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'department_id.exists' => 'El departamento seleccionado no existe',
                'city_id.exists' => 'La ciudad seleccionada no existe',
                'responsible_user_id.exists' => 'El usuario responsable seleccionado no existe',
                'nic.unique' => 'Este número de identificación ya está registrado',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si no se proporciona un usuario responsable, usar el usuario autenticado
            $requestData = $request->all();
            if (!isset($requestData['responsible_user_id'])) {
                $requestData['responsible_user_id'] = auth()->id();
            }

            $client = Client::create($requestData);

            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client
                ],
                'message' => 'Cliente creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un cliente existente
     */
    public function update(Request $request, $id)
    {
        try {
            \Log::info('=== INICIO ACTUALIZACIÓN CLIENTE ===');
            \Log::info('ID recibido: ' . $id);
            
            $client = Client::findOrFail($id);
            
            \Log::info('Cliente encontrado:', [
                'client_id' => $client->client_id,
                'name' => $client->name,
                'email' => $client->email
            ]);
            
            \Log::info('Datos de solicitud recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'client_type' => 'sometimes|required|string|in:residencial,comercial,empresa',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    'unique:clients,email,' . $client->client_id . ',client_id'
                ],
                'phone' => 'nullable|string|max:20',
                'nic' => [
                    'nullable',
                    'string',
                    'max:50',
                    'unique:clients,nic,' . $client->client_id . ',client_id'
                ],
                'responsible_user_id' => 'nullable|exists:users,id',
                'department_id' => 'nullable|exists:departments,department_id',
                'city_id' => 'nullable|exists:cities,city_id',
                'address' => 'nullable|string|max:500',

                'monthly_consumption' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'is_active' => 'sometimes|boolean',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'client_type.required' => 'El tipo de cliente es obligatorio',
                'client_type.in' => 'El tipo de cliente debe ser residencial, comercial o empresa',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'responsible_user_id.exists' => 'El usuario responsable seleccionado no existe',
                'department_id.exists' => 'El departamento seleccionado no existe',
                'city_id.exists' => 'La ciudad seleccionada no existe',

                'nic.unique' => 'Este número de identificación ya está registrado',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            \Log::info('Datos validados:', $validatedData);

            $client->update($validatedData);

            \Log::info('Cliente actualizado exitosamente:', [
                'client_id' => $client->client_id,
                'name' => $client->name,
                'email' => $client->email
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client
                ],
                'message' => 'Cliente actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar cliente: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un cliente
     */
    public function destroy($id)
    {
        try {
            $client = Client::findOrFail($id);
            
            $client->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un cliente
     */
    public function toggleStatus($id)
    {
        try {
            $client = Client::findOrFail($id);
            $client->is_active = !$client->is_active;
            $client->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client
                ],
                'message' => $client->is_active ? 'Cliente activado exitosamente' : 'Cliente desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de clientes
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_clients' => Client::count(),
                'active_clients' => Client::where('is_active', true)->count(),
                'inactive_clients' => Client::where('is_active', false)->count(),
                'by_company' => Client::select('company')
                    ->whereNotNull('company')
                    ->where('company', '!=', '')
                    ->distinct()
                    ->orderBy('company')
                    ->pluck('company'),
                'recent_clients' => Client::where('created_at', '>=', now()->subDays(30))->count(),
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
     * Obtener opciones para formularios (empresas, ciudades, etc.)
     */
    public function options()
    {
        try {
            $options = [
                'document_types' => collect([
                    ['value' => 'CC', 'label' => 'Cédula de Ciudadanía'],
                    ['value' => 'NIT', 'label' => 'Número de Identificación Tributaria'],
                    ['value' => 'CE', 'label' => 'Cédula de Extranjería'],
                    ['value' => 'PASS', 'label' => 'Pasaporte'],
                    ['value' => 'RUT', 'label' => 'Registro Único Tributario'],
                ]),
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
}