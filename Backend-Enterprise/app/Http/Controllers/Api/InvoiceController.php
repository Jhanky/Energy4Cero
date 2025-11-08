<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Arr;

class InvoiceController extends Controller
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
     * Listar facturas con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Invoice::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->search($search);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('payment_type')) {
                $query->where('payment_type', $request->payment_type);
            }

            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            if ($request->filled('cost_center_id')) {
                $query->where('cost_center_id', $request->cost_center_id);
            }

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->byDateRange($request->start_date, $request->end_date);
            }

            // Ordenamiento - por defecto por fecha de emisión descendente (más recientes primero)
            $sortBy = $request->get('sort_by', 'invoice_id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación con relaciones
            $perPage = $request->get('per_page', 15);
            $invoices = $query->with(['supplier', 'costCenter'])->paginate($perPage);

            // Agregar estadísticas
            $stats = [
                'total' => Invoice::count(),
                'pending' => Invoice::where('status', 'pendiente')->count(),
                'paid' => Invoice::where('status', 'pagada')->count(),
                'cancelled' => Invoice::where('status', 'anulada')->count(),
                'total_amount' => Invoice::sum('total_value'),
                'pending_amount' => Invoice::where('status', 'pendiente')->sum('total_value'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'invoices' => $invoices->items(),
                    'pagination' => [
                        'current_page' => $invoices->currentPage(),
                        'per_page' => $invoices->perPage(),
                        'total' => $invoices->total(),
                        'last_page' => $invoices->lastPage(),
                        'from' => $invoices->firstItem(),
                        'to' => $invoices->lastItem(),
                    ],
                    'stats' => $stats,
                ],
                'message' => 'Facturas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener facturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una factura específica
     */
    public function show($id)
    {
        try {
            $invoice = Invoice::with(['supplier', 'costCenter'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'invoice' => $invoice
                ],
                'message' => 'Factura obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Factura no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear una nueva factura
     */
    public function store(Request $request)
    {
        try {
            $requestData = $request->all();

            // Validar que los datos sean un objeto y no un array
            if (!is_array($requestData) || $this->isArrayAList($requestData)) {
                \Log::error('Error: Se recibió un array en lugar de un objeto para la creación de la factura');
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de datos incorrecto. Se esperaba un objeto con las propiedades de la factura.',
                    'errors' => ['format' => ['Se esperaba un objeto con las propiedades de la factura, no un array']]
                ], 422);
            }

            \Log::info('Datos recibidos para crear factura:', $requestData);

            // Validar archivo si está presente
            if ($request->hasFile('file')) {
                $fileValidator = Validator::make(['file' => $request->file('file')], [
                    'file' => 'required|mimes:pdf,jpg,jpeg,png,gif,bmp,tiff,webp|max:5120', // 5MB max, más tipos de imagen
                ], [
                    'file.required' => 'El archivo es obligatorio',
                    'file.mimes' => 'El archivo debe ser PDF o imagen (JPG, JPEG, PNG, GIF, BMP, TIFF, WEBP)',
                    'file.max' => 'El archivo no puede superar los 5MB',
                ]);

                if ($fileValidator->fails()) {
                    \Log::warning('Validación de archivo fallida:', [
                        'errors' => $fileValidator->errors()->toArray(),
                        'file_info' => [
                            'original_name' => $request->file('file')->getClientOriginalName(),
                            'mime_type' => $request->file('file')->getMimeType(),
                            'size' => $request->file('file')->getSize(),
                            'extension' => $request->file('file')->getClientOriginalExtension(),
                        ]
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Archivo inválido',
                        'errors' => $fileValidator->errors()
                    ], 422);
                }
            }

            $validator = Validator::make($requestData, [
                'supplier_id' => 'required|exists:suppliers,supplier_id',
                'cost_center_id' => 'required|exists:cost_centers,cost_center_id',
                'invoice_number' => 'required|string|max:50|unique:invoices,invoice_number',
                'amount_before_iva' => 'required|numeric|min:0',
                'total_value' => 'required|numeric|min:0|gte:amount_before_iva',
                'status' => 'required|string|in:pendiente,pagada,anulada',
                'payment_type' => 'required|string|in:parcial,total',
                'issue_date' => 'required|date|before_or_equal:today',
                'due_date' => 'nullable|date|after:issue_date',
                'notes' => 'nullable|string|max:1000',
            ], [
                'supplier_id.required' => 'El proveedor es obligatorio',
                'supplier_id.exists' => 'El proveedor seleccionado no existe',
                'cost_center_id.required' => 'El centro de costos es obligatorio',
                'cost_center_id.exists' => 'El centro de costos seleccionado no existe',
                'invoice_number.required' => 'El número de factura es obligatorio',
                'invoice_number.unique' => 'Este número de factura ya está registrado',
                'amount_before_iva.required' => 'El monto antes de IVA es obligatorio',
                'amount_before_iva.numeric' => 'El monto antes de IVA debe ser un número',
                'amount_before_iva.min' => 'El monto antes de IVA no puede ser negativo',
                'total_value.required' => 'El valor total es obligatorio',
                'total_value.numeric' => 'El valor total debe ser un número',
                'total_value.min' => 'El valor total no puede ser negativo',
                'total_value.gte' => 'El valor total debe ser mayor o igual al monto antes de IVA',
                'status.required' => 'El estado es obligatorio',
                'status.in' => 'El estado debe ser pendiente, pagada o anulada',
                'payment_type.required' => 'El tipo de pago es obligatorio',
                'payment_type.in' => 'El tipo de pago debe ser parcial o total',
                'issue_date.required' => 'La fecha de emisión es obligatoria',
                'issue_date.date' => 'La fecha de emisión debe ser una fecha válida',
                'issue_date.before_or_equal' => 'La fecha de emisión no puede ser futura',
                'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida',
                'due_date.after' => 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
            ]);

            if ($validator->fails()) {
                \Log::error('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear la factura
            $invoice = Invoice::create($requestData);

            // Manejar archivo si está presente
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = 'invoices/' . $invoice->invoice_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('invoices', basename($fileName), 'public');

                \Log::info('Archivo guardado', [
                    'invoice_id' => $invoice->invoice_id,
                    'original_name' => $file->getClientOriginalName(),
                    'stored_path' => $path,
                    'file_size' => $file->getSize(),
                    'full_path' => Storage::disk('public')->path($path),
                    'exists_after_save' => Storage::disk('public')->exists($path)
                ]);

                // Actualizar factura con la ruta del archivo
                $invoice->file_path = $path;
                $invoice->save();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'invoice' => $invoice->load(['supplier', 'costCenter'])
                ],
                'message' => 'Factura creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una factura existente
     */
    public function update(Request $request, $id)
    {
        try {
            \Log::info('=== INICIO ACTUALIZACIÓN FACTURA ===');
            \Log::info('ID recibido: ' . $id);

            $invoice = Invoice::findOrFail($id);

            \Log::info('Factura encontrada:', [
                'invoice_id' => $invoice->invoice_id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $invoice->status
            ]);

            \Log::info('Datos de solicitud recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'supplier_id' => 'sometimes|required|exists:suppliers,supplier_id',
                'cost_center_id' => 'sometimes|required|exists:cost_centers,cost_center_id',
                'invoice_number' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:50',
                    'unique:invoices,invoice_number,' . $invoice->invoice_id . ',invoice_id'
                ],
                'amount_before_iva' => 'sometimes|required|numeric|min:0',
                'total_value' => 'sometimes|required|numeric|min:0',
                'status' => 'sometimes|required|string|in:pendiente,pagada,anulada',
                'payment_type' => 'sometimes|required|string|in:parcial,total',
                'issue_date' => 'sometimes|required|date|before_or_equal:today',
                'due_date' => 'nullable|date|after:issue_date',
                'file_path' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ], [
                'supplier_id.required' => 'El proveedor es obligatorio',
                'supplier_id.exists' => 'El proveedor seleccionado no existe',
                'cost_center_id.required' => 'El centro de costos es obligatorio',
                'cost_center_id.exists' => 'El centro de costos seleccionado no existe',
                'invoice_number.required' => 'El número de factura es obligatorio',
                'invoice_number.unique' => 'Este número de factura ya está registrado',
                'amount_before_iva.required' => 'El monto antes de IVA es obligatorio',
                'amount_before_iva.numeric' => 'El monto antes de IVA debe ser un número',
                'amount_before_iva.min' => 'El monto antes de IVA no puede ser negativo',
                'total_value.required' => 'El valor total es obligatorio',
                'total_value.numeric' => 'El valor total debe ser un número',
                'total_value.min' => 'El valor total no puede ser negativo',
                'status.required' => 'El estado es obligatorio',
                'status.in' => 'El estado debe ser pendiente, pagada o anulada',
                'payment_type.required' => 'El tipo de pago es obligatorio',
                'payment_type.in' => 'El tipo de pago debe ser parcial o total',
                'issue_date.required' => 'La fecha de emisión es obligatoria',
                'issue_date.date' => 'La fecha de emisión debe ser una fecha válida',
                'issue_date.before_or_equal' => 'La fecha de emisión no puede ser futura',
                'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida',
                'due_date.after' => 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
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

            // Validar que total_value >= amount_before_iva si ambos están presentes
            if (isset($validatedData['total_value']) && isset($validatedData['amount_before_iva'])) {
                if ($validatedData['total_value'] < $validatedData['amount_before_iva']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Datos de entrada inválidos',
                        'errors' => ['total_value' => ['El valor total debe ser mayor o igual al monto antes de IVA']]
                    ], 422);
                }
            } elseif (isset($validatedData['total_value']) && !isset($validatedData['amount_before_iva'])) {
                if ($validatedData['total_value'] < $invoice->amount_before_iva) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Datos de entrada inválidos',
                        'errors' => ['total_value' => ['El valor total debe ser mayor o igual al monto antes de IVA']]
                    ], 422);
                }
            } elseif (!isset($validatedData['total_value']) && isset($validatedData['amount_before_iva'])) {
                if ($invoice->total_value < $validatedData['amount_before_iva']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Datos de entrada inválidos',
                        'errors' => ['amount_before_iva' => ['El monto antes de IVA no puede ser mayor al valor total']]
                    ], 422);
                }
            }

            \Log::info('Datos validados:', $validatedData);

            $invoice->update($validatedData);

            \Log::info('Factura actualizada exitosamente:', [
                'invoice_id' => $invoice->invoice_id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $invoice->status
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'invoice' => $invoice->load(['supplier', 'costCenter'])
                ],
                'message' => 'Factura actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar factura: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una factura
     */
    public function destroy($id)
    {
        try {
            $invoice = Invoice::findOrFail($id);

            // Eliminar archivo si existe
            if ($invoice->file_path && Storage::disk('public')->exists($invoice->file_path)) {
                Storage::disk('public')->delete($invoice->file_path);
            }

            $invoice->delete();

            return response()->json([
                'success' => true,
                'message' => 'Factura eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado de una factura
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $invoice = Invoice::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:pendiente,pagada,anulada',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice->status = $request->status;
            $invoice->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'invoice' => $invoice->load(['supplier', 'costCenter'])
                ],
                'message' => 'Estado de factura actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado de factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir archivo de factura
     */
    public function uploadFile(Request $request, $id)
    {
        try {
            $invoice = Invoice::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'file' => 'required|mimes:pdf,jpg,jpeg,png,gif,bmp,tiff,webp|max:5120', // 5MB max, más tipos de imagen
            ], [
                'file.required' => 'El archivo es obligatorio',
                'file.mimes' => 'El archivo debe ser PDF o imagen (JPG, JPEG, PNG, GIF, BMP, TIFF, WEBP)',
                'file.max' => 'El archivo no puede superar los 5MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Eliminar archivo anterior si existe
            if ($invoice->file_path && Storage::disk('public')->exists($invoice->file_path)) {
                Storage::disk('public')->delete($invoice->file_path);
            }

            // Guardar nuevo archivo
            $file = $request->file('file');
            $fileName = 'invoices/' . $invoice->invoice_id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('invoices', basename($fileName), 'public');

            // Actualizar factura con la nueva ruta
            $invoice->file_path = $path;
            $invoice->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'invoice' => $invoice->load(['supplier', 'costCenter']),
                    'file_url' => Storage::disk('public')->url($path)
                ],
                'message' => 'Archivo subido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descargar archivo de factura
     */
    public function downloadFile($id)
    {
        try {
            $invoice = Invoice::findOrFail($id);

            \Log::info('Descargando archivo para factura ID: ' . $id, [
                'file_path' => $invoice->file_path,
                'exists' => $invoice->file_path ? Storage::disk('public')->exists($invoice->file_path) : false,
                'full_path' => $invoice->file_path ? Storage::disk('public')->path($invoice->file_path) : null,
            ]);

            if (!$invoice->file_path) {
                \Log::warning('Factura sin file_path', ['invoice_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Esta factura no tiene archivo adjunto'
                ], 404);
            }

            if (!Storage::disk('public')->exists($invoice->file_path)) {
                \Log::warning('Archivo no existe en storage', [
                    'invoice_id' => $id,
                    'file_path' => $invoice->file_path,
                    'full_path' => Storage::disk('public')->path($invoice->file_path)
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo no encontrado en el servidor'
                ], 404);
            }

            // Verificar tamaño del archivo
            $fileSize = Storage::disk('public')->size($invoice->file_path);
            \Log::info('Archivo encontrado', [
                'invoice_id' => $id,
                'file_path' => $invoice->file_path,
                'size' => $fileSize
            ]);

            if ($fileSize === 0) {
                \Log::warning('Archivo vacío', ['invoice_id' => $id, 'file_path' => $invoice->file_path]);
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo está vacío'
                ], 404);
            }

            return Storage::disk('public')->download($invoice->file_path);

        } catch (\Exception $e) {
            \Log::error('Error al descargar archivo', [
                'invoice_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de facturas
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_invoices' => Invoice::count(),
                'pending_invoices' => Invoice::where('status', 'pendiente')->count(),
                'paid_invoices' => Invoice::where('status', 'pagada')->count(),
                'cancelled_invoices' => Invoice::where('status', 'anulada')->count(),
                'total_amount' => Invoice::sum('total_value'),
                'pending_amount' => Invoice::where('status', 'pendiente')->sum('total_value'),
                'paid_amount' => Invoice::where('status', 'pagada')->sum('total_value'),
                'overdue_invoices' => Invoice::where('status', 'pendiente')
                    ->where('due_date', '<', now())
                    ->whereNotNull('due_date')
                    ->count(),
                'by_supplier' => Invoice::selectRaw('supplier_id, COUNT(*) as count, SUM(total_value) as total')
                    ->with('supplier')
                    ->groupBy('supplier_id')
                    ->orderBy('total', 'desc')
                    ->take(10)
                    ->get(),
                'monthly_stats' => Invoice::selectRaw('YEAR(issue_date) as year, MONTH(issue_date) as month, COUNT(*) as count, SUM(total_value) as total')
                    ->where('issue_date', '>=', now()->subMonths(12))
                    ->groupBy('year', 'month')
                    ->orderBy('year', 'desc')
                    ->orderBy('month', 'desc')
                    ->get(),
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
     * Obtener opciones para formularios
     */
    public function options()
    {
        try {
            $options = [
                'statuses' => collect([
                    ['value' => 'pendiente', 'label' => 'Pendiente'],
                    ['value' => 'pagada', 'label' => 'Pagada'],
                    ['value' => 'anulada', 'label' => 'Anulada'],
                ]),
                'payment_types' => collect([
                    ['value' => 'parcial', 'label' => 'Pago Parcial'],
                    ['value' => 'total', 'label' => 'Pago Total'],
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
