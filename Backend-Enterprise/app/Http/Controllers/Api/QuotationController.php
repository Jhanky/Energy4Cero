<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\UsedProduct;
use App\Models\QuotationAdditionalItem;
use App\Models\Client;
use App\Models\User;
use App\Models\QuotationStatus;
use App\Models\Panel;
use App\Models\Inverter;
use App\Models\Battery;
use App\Models\Project;
use App\Models\ProjectState;
use App\Models\CostCenter;
use App\Models\Department;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf;

class QuotationController extends Controller
{
    /**
     * 1. Listar Cotizaciones
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Log para diagnóstico
            $user = auth()->user();
            \Log::info('📥 Solicitud de cotizaciones', [
                'user_id' => $user ? $user->id : 'no-auth',
                'user_email' => $user ? $user->email : 'no-auth',
                'user_role' => $user && $user->role ? $user->role->slug : 'no-role',
                'request_params' => $request->all()
            ]);

            $query = Quotation::with([
                'client:client_id,name,nic,client_type,department_id,city_id,email',
                'user:id,name,email',
                'status:status_id,name,color'
            ]);

            // FILTRO DE SEGURIDAD: Usuarios comerciales solo ven sus propias cotizaciones
            if ($user && $user->role && $user->role->slug === 'comercial') {
                \Log::info('🔒 Aplicando filtro de seguridad para usuario comercial', [
                    'user_id' => $user->id
                ]);
                $query->where('user_id', $user->id);
            } else {
                \Log::info('✅ Usuario NO es comercial, mostrando todas las cotizaciones', [
                    'user_role' => $user && $user->role ? $user->role->slug : 'no-role'
                ]);
            }

            // Filtros - IMPORTANTE: Usar filled() en lugar de has() para evitar filtrar con valores null
            if ($request->filled('status_id')) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->filled('status')) {
                $query->whereHas('status', function ($statusQuery) use ($request) {
                    $statusQuery->where('name', $request->status);
                });
            }

            if ($request->filled('client_type')) {
                $query->whereHas('client', function ($clientQuery) use ($request) {
                    $clientQuery->where('client_type', $request->client_type);
                });
            }

            if ($request->filled('seller')) {
                $query->whereHas('user', function ($userQuery) use ($request) {
                    $userQuery->where('name', 'LIKE', '%' . $request->seller . '%');
                });
            }

            if ($request->filled('system_type')) {
                $query->where('system_type', $request->system_type);
            }

            if ($request->filled('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('project_name', 'like', "%{$search}%")
                      ->orWhereHas('client', function($clientQuery) use ($search) {
                          $clientQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('nic', 'like', "%{$search}%");
                      });
                });
            }

            // Log de la consulta SQL antes de ejecutar
            \Log::info('🔍 SQL Query', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $quotations = $query->paginate($request->get('per_page', 15));

            \Log::info('📊 Resultado de la consulta', [
                'total' => $quotations->total(),
                'count' => $quotations->count(),
                'per_page' => $quotations->perPage(),
                'current_page' => $quotations->currentPage()
            ]);

            // Agregar número de cotización y datos adicionales
            $quotations->getCollection()->transform(function ($quotation) {
                $quotationArray = $quotation->toArray();
                $quotationArray['quotation_number'] = $quotation->quotation_number;
                return $quotationArray;
            });

            return response()->json([
                'success' => true,
                'data' => $quotations,
                'message' => 'Cotizaciones obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener cotizaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. Obtener Más Información de Cotización
     */
    public function show($id): JsonResponse
    {
        try {
            $quotation = Quotation::with([
                'client.department',
                'client.city',
                'user',
                'status',
                'usedProducts',
                'items'
            ])->find($id);

            if (!$quotation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            // Formatear la respuesta con todos los detalles
            $formattedResponse = [
                'quotation_id' => $quotation->quotation_id,
                'client_id' => $quotation->client_id,
                'user_id' => $quotation->user_id,
                'project_name' => $quotation->project_name,
                'system_type' => $quotation->system_type,
                'grid_type' => $quotation->grid_type,
                'power_kwp' => number_format($quotation->power_kwp, 2, '.', ''),
                'panel_count' => $quotation->panel_count,
                'requires_financing' => $quotation->requires_financing ? 1 : 0,
                'profit_percentage' => number_format($quotation->profit_percentage, 3, '.', ''),
                'iva_profit_percentage' => number_format($quotation->iva_profit_percentage, 3, '.', ''),
                'commercial_management_percentage' => number_format($quotation->commercial_management_percentage, 3, '.', ''),
                'administration_percentage' => number_format($quotation->administration_percentage, 3, '.', ''),
                'contingency_percentage' => number_format($quotation->contingency_percentage, 3, '.', ''),
                'withholding_percentage' => number_format($quotation->withholding_percentage, 3, '.', ''),
                'subtotal' => $quotation->subtotal,
                'profit' => $quotation->profit,
                'profit_iva' => $quotation->profit_iva,
                'commercial_management' => $quotation->commercial_management,
                'administration' => $quotation->administration,
                'contingency' => $quotation->contingency,
                'withholdings' => $quotation->withholdings,
                'total_value' => $quotation->total_value,
                'creation_date' => $quotation->created_at,
                'subtotal2' => $quotation->subtotal2,
                'subtotal3' => $quotation->subtotal3,
                'status_id' => $quotation->status_id,
                'status' => [
                    'status_id' => $quotation->status->status_id,
                    'name' => $quotation->status->name,
                    'description' => $quotation->status->description,
                    'color' => $quotation->status->color
                ],
                'client' => [
                    'client_id' => $quotation->client->client_id,
                    'name' => $quotation->client->name,
                    'nic' => $quotation->client->nic,
                    'client_type' => $quotation->client->client_type,
                    'email' => $quotation->client->email,
                    'phone' => $quotation->client->phone,
                    'address' => $quotation->client->address,
                    'monthly_consumption' => $quotation->client->monthly_consumption,
                    'department' => $quotation->client->department ? [
                        'department_id' => $quotation->client->department->department_id,
                        'name' => $quotation->client->department->name,
                        'region' => $quotation->client->department->region,
                    ] : null,
                    'city' => $quotation->client->city ? [
                        'city_id' => $quotation->client->city->city_id,
                        'name' => $quotation->client->city->name,
                        'department_id' => $quotation->client->city->department_id,
                    ] : null
                ],
                'user' => [
                    'id' => $quotation->user->id,
                    'name' => $quotation->user->name,
                    'email' => $quotation->user->email
                ],
                'products' => $quotation->usedProducts->map(function ($product) {
                    return [
                        'used_product_id' => $product->used_product_id,
                        'quotation_id' => $product->quotation_id,
                        'product_id' => $product->product_id,
                        'product_type' => $product->product_type,
                        'brand' => $product->brand,
                        'model' => $product->model,
                        'quantity' => $product->quantity,
                        'unit_price' => number_format($product->unit_price, 2, '.', ''),
                        'partial_value' => number_format($product->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($product->profit_percentage, 3, '.', ''),
                        'profit' => number_format($product->profit, 2, '.', ''),
                        'total_value' => number_format($product->total_value, 2, '.', '')
                    ];
                }),
                'quotation_items' => $quotation->items->map(function ($item) {
                    return [
                        'quotation_item_id' => $item->item_id,
                        'quotation_id' => $item->quotation_id,
                        'description' => $item->description,
                        'item_type' => $item->item_type,
                        'quantity' => number_format($item->quantity, 2, '.', ''),
                        'unit' => $item->unit,
                        'unit_price' => number_format($item->unit_price, 2, '.', ''),
                        'partial_value' => number_format($item->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($item->profit_percentage, 3, '.', ''),
                        'profit' => number_format($item->profit, 2, '.', ''),
                        'total_value' => number_format($item->total_value, 2, '.', '')
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedResponse,
                'message' => 'Cotización obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 3. Crear Cotización
     * 
     * IMPORTANTE: El backend realiza TODOS los cálculos automáticamente
     * basándose en los productos, items y porcentajes enviados.
     * 
     * El frontend solo envía: productos con cantidades y precios, items con cantidades y precios,
     * y los porcentajes de ganancia. El backend calcula: subtotales, ganancias, IVA, 
     * gestión comercial, administración, contingencia, retenciones y total final.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Agregar log para depuración
            \Log::info('📥 Recibiendo datos de cotización del frontend:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'client_id' => 'required|exists:clients,client_id',
                'user_id' => 'required|exists:users,id',
                'project_name' => 'required|string|max:200',
                'system_type' => 'required|in:On-grid,Off-grid,Híbrido,Interconectado',
                'grid_type' => 'required|string|max:255',
                'power_kwp' => 'required|numeric|min:0.1',
                'panel_count' => 'required|integer|min:1',
                'requires_financing' => 'sometimes|boolean',
                'profit_percentage' => 'required|numeric|min:0|max:1',
                'iva_profit_percentage' => 'required|numeric|min:0|max:1',
                'commercial_management_percentage' => 'required|numeric|min:0|max:1',
                'administration_percentage' => 'required|numeric|min:0|max:1',
                'contingency_percentage' => 'required|numeric|min:0|max:1',
                'withholding_percentage' => 'required|numeric|min:0|max:1',
                'status_id' => 'sometimes|exists:quotation_statuses,status_id',
                'products' => 'sometimes|array',
                'products.*.product_type' => 'required_with:products|in:panel,inverter,battery',
                'products.*.product_id' => 'required_with:products|integer',
                'products.*.quantity' => 'required_with:products|integer|min:1',
                'products.*.unit_price' => 'required_with:products|numeric|min:0',
                'products.*.profit_percentage' => 'required_with:products|numeric|min:0|max:1',
                'items' => 'sometimes|array',
                'items.*.description' => 'required_with:items|string|max:500',
                'items.*.item_type' => 'required_with:items|string|max:50',
                'items.*.quantity' => 'required_with:items|numeric|min:0.01',
                'items.*.unit' => 'required_with:items|string|max:20',
                'items.*.unit_price' => 'required_with:items|numeric|min:0',
                'items.*.profit_percentage' => 'required_with:items|numeric|min:0|max:1',
            ]);

            if ($validator->fails()) {
                // Agregar log para depuración de errores de validación
                \Log::error('❌ Error de validación en la creación de cotización:', [
                    'errors' => $validator->errors(),
                    'data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear la cotización con valores iniciales (se calcularán automáticamente)
            // Siempre asignar estado 1 (Borrador) por defecto
            $quotationData = $request->only([
                'client_id',
                'user_id',
                'project_name',
                'system_type',
                'grid_type',
                'power_kwp',
                'panel_count',
                'requires_financing',
                'profit_percentage',
                'iva_profit_percentage',
                'commercial_management_percentage',
                'administration_percentage',
                'contingency_percentage',
                'withholding_percentage',
            ]);
            
            // Asignar estado 1 (Borrador) por defecto
            $quotationData['status_id'] = 1;
            
            $quotation = Quotation::create($quotationData);

            // Crear productos utilizados si se enviaron
            if ($request->has('products')) {
                foreach ($request->products as $productData) {
                    // Calcular valores automáticamente
                    $partialValue = $productData['quantity'] * $productData['unit_price'];
                    $profit = $partialValue * $productData['profit_percentage'];
                    $totalValue = $partialValue + $profit;
                    
                    UsedProduct::create([
                        'quotation_id' => $quotation->quotation_id,
                        'product_type' => $productData['product_type'],
                        'product_id' => $productData['product_id'],
                        'brand' => $productData['brand'] ?? null,
                        'model' => $productData['model'] ?? null,
                        'quantity' => $productData['quantity'],
                        'unit_price' => $productData['unit_price'],
                        'profit_percentage' => $productData['profit_percentage'],
                        'partial_value' => $partialValue,
                        'profit' => $profit,
                        'total_value' => $totalValue,
                    ]);
                }
            }

            // Crear items si se enviaron
            if ($request->has('items')) {
                foreach ($request->items as $itemData) {
                    // Calcular valores automáticamente
                    $partialValue = $itemData['quantity'] * $itemData['unit_price'];
                    $profit = $partialValue * $itemData['profit_percentage'];
                    $totalValue = $partialValue + $profit;
                    
                    QuotationAdditionalItem::create([
                        'quotation_id' => $quotation->quotation_id,
                        'description' => $itemData['description'],
                        'item_type' => $itemData['item_type'],
                        'quantity' => $itemData['quantity'],
                        'unit' => $itemData['unit'],
                        'unit_price' => $itemData['unit_price'],
                        'profit_percentage' => $itemData['profit_percentage'],
                        'partial_value' => $partialValue,
                        'profit' => $profit,
                        'total_value' => $totalValue,
                    ]);
                }
            }

            // Cargar las relaciones necesarias para el cálculo
            $quotation->load(['usedProducts', 'items']);
            
            // Calcular todos los totales de la cotización automáticamente
            $quotation->calculateTotals();
            
            // Cargar datos completos para la respuesta
            $quotation->load(['client', 'user']);
            
            // Formatear la respuesta según el nuevo formato requerido
            $formattedResponse = [
                'quotation_id' => $quotation->quotation_id,
                'client_id' => $quotation->client_id,
                'user_id' => $quotation->user_id,
                'project_name' => $quotation->project_name,
                'system_type' => $quotation->system_type,
                'power_kwp' => number_format($quotation->power_kwp, 2, '.', ''),
                'panel_count' => $quotation->panel_count,
                'requires_financing' => $quotation->requires_financing ? 1 : 0,
                'profit_percentage' => number_format($quotation->profit_percentage, 3, '.', ''),
                'iva_profit_percentage' => number_format($quotation->iva_profit_percentage, 3, '.', ''),
                'commercial_management_percentage' => number_format($quotation->commercial_management_percentage, 3, '.', ''),
                'administration_percentage' => number_format($quotation->administration_percentage, 3, '.', ''),
                'contingency_percentage' => number_format($quotation->contingency_percentage, 3, '.', ''),
                'withholding_percentage' => number_format($quotation->withholding_percentage, 3, '.', ''),
                'subtotal' => $quotation->subtotal,
                'profit' => $quotation->profit,
                'profit_iva' => $quotation->profit_iva,
                'commercial_management' => $quotation->commercial_management,
                'administration' => $quotation->administration,
                'contingency' => $quotation->contingency,
                'withholdings' => $quotation->withholdings,
                'total_value' => $quotation->total_value,
                'creation_date' => $quotation->created_at,
                'subtotal2' => $quotation->subtotal2,
                'subtotal3' => $quotation->subtotal3,
                'status_id' => $quotation->status_id,
                'products' => $quotation->usedProducts->map(function ($product) {
                    return [
                        'used_product_id' => $product->used_product_id,
                        'quotation_id' => $product->quotation_id,
                        'product_id' => $product->product_id,
                        'product_type' => $product->product_type,
                        'quantity' => $product->quantity,
                        'unit_price' => number_format($product->unit_price, 2, '.', ''),
                        'partial_value' => number_format($product->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($product->profit_percentage, 3, '.', ''),
                        'profit' => number_format($product->profit, 2, '.', ''),
                        'total_value' => number_format($product->total_value, 2, '.', '')
                    ];
                }),
                'quotation_items' => $quotation->items->map(function ($item) {
                    return [
                        'quotation_item_id' => $item->item_id,
                        'quotation_id' => $item->quotation_id,
                        'description' => $item->description,
                        'item_type' => $item->item_type,
                        'quantity' => number_format($item->quantity, 2, '.', ''),
                        'unit' => $item->unit,
                        'unit_price' => number_format($item->unit_price, 2, '.', ''),
                        'partial_value' => number_format($item->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($item->profit_percentage, 3, '.', ''),
                        'profit' => number_format($item->profit, 2, '.', ''),
                        'total_value' => number_format($item->total_value, 2, '.', '')
                    ];
                })
            ];
            
            return response()->json([
                'success' => true,
                'data' => $formattedResponse,
                'message' => 'Cotización creada exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 4. Editar Cotización
     *
     * IMPORTANTE: Cuando el frontend edita productos o items, debe enviar TODOS los valores recalculados
     * porque los cambios afectan subtotales, ganancias, IVA, gestión comercial, administración,
     * contingencia, retenciones y total final.
     *
     * El frontend debe recalcular y enviar: subtotal, profit, profit_iva, commercial_management,
     * administration, contingency, withholdings, total_value, subtotal2, subtotal3
     */
    public function update(Request $request, $id): JsonResponse
    {
        \Log::info('🎯 MÉTODO UPDATE LLAMADO', [
            'quotation_id' => $id,
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'all_data' => $request->all()
        ]);

        try {
            \Log::info('🔄 Iniciando actualización de cotización', [
                'quotation_id' => $id,
                'request_data' => $request->all()
            ]);

            $quotation = Quotation::find($id);
            if (!$quotation) {
                \Log::error('❌ Cotización no encontrada', ['quotation_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            \Log::info('✅ Cotización encontrada', [
                'quotation_id' => $quotation->quotation_id,
                'current_data' => $quotation->toArray()
            ]);

            $validator = Validator::make($request->all(), [
                'client_id' => 'sometimes|exists:clients,client_id',
                'user_id' => 'sometimes|exists:users,id',
                'project_name' => 'sometimes|string|max:200',
                'system_type' => 'sometimes|in:On-grid,Off-grid,Híbrido',
                'power_kwp' => 'sometimes|numeric|min:0.1',
                'panel_count' => 'sometimes|integer|min:1',
                'requires_financing' => 'sometimes|boolean',
                'profit_percentage' => 'sometimes|numeric|min:0|max:1',
                'iva_profit_percentage' => 'sometimes|numeric|min:0|max:1',
                'commercial_management_percentage' => 'sometimes|numeric|min:0|max:1',
                'administration_percentage' => 'sometimes|numeric|min:0|max:1',
                'contingency_percentage' => 'sometimes|numeric|min:0|max:1',
                'withholding_percentage' => 'sometimes|numeric|min:0|max:1',
                'status_id' => 'sometimes|exists:quotation_statuses,status_id',
                'subtotal' => 'sometimes|numeric|min:0',
                'profit' => 'sometimes|numeric|min:0',
                'profit_iva' => 'sometimes|numeric|min:0',
                'commercial_management' => 'sometimes|numeric|min:0',
                'administration' => 'sometimes|numeric|min:0',
                'contingency' => 'sometimes|numeric|min:0',
                'withholdings' => 'sometimes|numeric|min:0',
                'total_value' => 'sometimes|numeric|min:0',
                'subtotal2' => 'sometimes|numeric|min:0',
                'subtotal3' => 'sometimes|numeric|min:0',
                'used_products' => 'sometimes|array',
                'used_products.*.used_product_id' => 'sometimes|exists:used_products,used_product_id',
                'used_products.*.quantity' => 'sometimes|integer|min:1',
                'used_products.*.unit_price' => 'sometimes|numeric|min:0',
                'used_products.*.profit_percentage' => 'sometimes|numeric|min:0|max:1',
                'used_products.*.partial_value' => 'sometimes|numeric|min:0',
                'used_products.*.profit' => 'sometimes|numeric|min:0',
                'used_products.*.total_value' => 'sometimes|numeric|min:0',
                'items' => 'sometimes|array',
                'items.*.item_id' => 'sometimes|exists:quotation_items,item_id',
                'items.*.description' => 'sometimes|string|max:500',
                'items.*.item_type' => 'sometimes|string|max:50',
                'items.*.quantity' => 'sometimes|numeric|min:0.01',
                'items.*.unit' => 'sometimes|string|max:20',
                'items.*.unit_price' => 'sometimes|numeric|min:0',
                'items.*.profit_percentage' => 'sometimes|numeric|min:0|max:1',
                'items.*.partial_value' => 'sometimes|numeric|min:0',
                'items.*.profit' => 'sometimes|numeric|min:0',
                'items.*.total_value' => 'sometimes|numeric|min:0',
            ]);

            if ($validator->fails()) {
                \Log::error('❌ Error de validación en actualización', [
                    'quotation_id' => $id,
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('✅ Validación exitosa, procediendo con actualización', [
                'quotation_id' => $id,
                'fields_to_update' => array_keys($request->all())
            ]);

            // Actualizar solo los campos enviados
            $updateData = $request->only([
                'client_id',
                'user_id',
                'project_name',
                'system_type',
                'power_kwp',
                'panel_count',
                'requires_financing',
                'profit_percentage',
                'iva_profit_percentage',
                'commercial_management_percentage',
                'administration_percentage',
                'contingency_percentage',
                'withholding_percentage',
                'subtotal',
                'profit',
                'profit_iva',
                'commercial_management',
                'administration',
                'contingency',
                'withholdings',
                'total_value',
                'subtotal2',
                'subtotal3',
                'status_id',
            ]);

            \Log::info('📝 Datos a actualizar en cotización', [
                'quotation_id' => $id,
                'update_data' => $updateData
            ]);

            $quotation->update($updateData);

            \Log::info('✅ Cotización actualizada exitosamente', [
                'quotation_id' => $id,
                'updated_at' => $quotation->updated_at
            ]);

            // Actualizar productos utilizados si se enviaron
            if ($request->has('used_products')) {
                \Log::info('🔄 Actualizando productos utilizados', [
                    'quotation_id' => $id,
                    'products_count' => count($request->used_products)
                ]);

                foreach ($request->used_products as $index => $productData) {
                    \Log::info('📦 Procesando producto', [
                        'index' => $index,
                        'used_product_id' => $productData['used_product_id'] ?? 'no-id',
                        'product_data' => $productData
                    ]);

                    if (isset($productData['used_product_id'])) {
                        $usedProduct = UsedProduct::find($productData['used_product_id']);
                        if ($usedProduct && $usedProduct->quotation_id == $quotation->quotation_id) {
                            $updateProductData = [
                                'quantity' => $productData['quantity'] ?? $usedProduct->quantity,
                                'unit_price' => $productData['unit_price'] ?? $usedProduct->unit_price,
                                'profit_percentage' => $productData['profit_percentage'] ?? $usedProduct->profit_percentage,
                                'partial_value' => $productData['partial_value'] ?? $usedProduct->partial_value,
                                'profit' => $productData['profit'] ?? $usedProduct->profit,
                                'total_value' => $productData['total_value'] ?? $usedProduct->total_value,
                                'brand' => $productData['brand'] ?? $usedProduct->brand,
                                'model' => $productData['model'] ?? $usedProduct->model,
                            ];

                            \Log::info('🔄 Actualizando producto usado', [
                                'used_product_id' => $productData['used_product_id'],
                                'update_data' => $updateProductData
                            ]);

                            $usedProduct->update($updateProductData);
                        } else {
                            \Log::warning('⚠️ Producto usado no encontrado o no pertenece a la cotización', [
                                'used_product_id' => $productData['used_product_id'],
                                'quotation_id' => $quotation->quotation_id,
                                'found_product_quotation_id' => $usedProduct ? $usedProduct->quotation_id : 'null'
                            ]);
                        }
                    } else {
                        \Log::warning('⚠️ Producto sin used_product_id', ['product_data' => $productData]);
                    }
                }
            }

            // Actualizar items si se enviaron
            if ($request->has('items')) {
                \Log::info('🔄 Actualizando items adicionales', [
                    'quotation_id' => $id,
                    'items_count' => count($request->items)
                ]);

                foreach ($request->items as $index => $itemData) {
                    \Log::info('📦 Procesando item', [
                        'index' => $index,
                        'item_id' => $itemData['item_id'] ?? 'no-id',
                        'item_data' => $itemData
                    ]);

                    if (isset($itemData['item_id'])) {
                        $item = QuotationAdditionalItem::find($itemData['item_id']);
                        if ($item && $item->quotation_id == $quotation->quotation_id) {
                            $updateItemData = [
                                'description' => $itemData['description'] ?? $item->description,
                                'item_type' => $itemData['item_type'] ?? $item->item_type,
                                'quantity' => $itemData['quantity'] ?? $item->quantity,
                                'unit' => $itemData['unit'] ?? $item->unit,
                                'unit_price' => $itemData['unit_price'] ?? $item->unit_price,
                                'profit_percentage' => $itemData['profit_percentage'] ?? $item->profit_percentage,
                                'partial_value' => $itemData['partial_value'] ?? $item->partial_value,
                                'profit' => $itemData['profit'] ?? $item->profit,
                                'total_value' => $itemData['total_value'] ?? $item->total_value,
                            ];

                            \Log::info('🔄 Actualizando item adicional', [
                                'item_id' => $itemData['item_id'],
                                'update_data' => $updateItemData
                            ]);

                            $item->update($updateItemData);
                        } else {
                            \Log::warning('⚠️ Item adicional no encontrado o no pertenece a la cotización', [
                                'item_id' => $itemData['item_id'],
                                'quotation_id' => $quotation->quotation_id,
                                'found_item_quotation_id' => $item ? $item->quotation_id : 'null'
                            ]);
                        }
                    } else {
                        \Log::warning('⚠️ Item sin item_id', ['item_data' => $itemData]);
                    }
                }
            }

            // Cargar datos actualizados para la respuesta incluyendo relaciones
            $quotation->load(['client', 'user', 'usedProducts', 'items']);

            // Formatear la respuesta con todos los detalles igual que en el método show
            $formattedResponse = [
                'quotation_id' => $quotation->quotation_id,
                'client_id' => $quotation->client_id,
                'user_id' => $quotation->user_id,
                'project_name' => $quotation->project_name,
                'system_type' => $quotation->system_type,
                'power_kwp' => number_format($quotation->power_kwp, 2, '.', ''),
                'panel_count' => $quotation->panel_count,
                'requires_financing' => $quotation->requires_financing ? 1 : 0,
                'profit_percentage' => number_format($quotation->profit_percentage, 3, '.', ''),
                'iva_profit_percentage' => number_format($quotation->iva_profit_percentage, 3, '.', ''),
                'commercial_management_percentage' => number_format($quotation->commercial_management_percentage, 3, '.', ''),
                'administration_percentage' => number_format($quotation->administration_percentage, 3, '.', ''),
                'contingency_percentage' => number_format($quotation->contingency_percentage, 3, '.', ''),
                'withholding_percentage' => number_format($quotation->withholding_percentage, 3, '.', ''),
                'subtotal' => $quotation->subtotal,
                'profit' => $quotation->profit,
                'profit_iva' => $quotation->profit_iva,
                'commercial_management' => $quotation->commercial_management,
                'administration' => $quotation->administration,
                'contingency' => $quotation->contingency,
                'withholdings' => $quotation->withholdings,
                'total_value' => $quotation->total_value,
                'creation_date' => $quotation->created_at,
                'subtotal2' => $quotation->subtotal2,
                'subtotal3' => $quotation->subtotal3,
                'status_id' => $quotation->status_id,
                'client' => [
                    'client_id' => $quotation->client->client_id,
                    'name' => $quotation->client->name,
                    'nic' => $quotation->client->nic,
                    'client_type' => $quotation->client->client_type,
                    'email' => $quotation->client->email,
                    'phone' => $quotation->client->phone,
                    'address' => $quotation->client->address,
                    'monthly_consumption' => $quotation->client->monthly_consumption,
                    'department' => $quotation->client->department ? [
                        'department_id' => $quotation->client->department->department_id,
                        'name' => $quotation->client->department->name,
                        'region' => $quotation->client->department->region,
                    ] : null,
                    'city' => $quotation->client->city ? [
                        'city_id' => $quotation->client->city->city_id,
                        'name' => $quotation->client->city->name,
                        'department_id' => $quotation->client->city->department_id,
                    ] : null
                ],
                'user' => [
                    'id' => $quotation->user->id,
                    'name' => $quotation->user->name,
                    'email' => $quotation->user->email
                ],
                'products' => $quotation->usedProducts->map(function ($product) {
                    return [
                        'used_product_id' => $product->used_product_id,
                        'quotation_id' => $product->quotation_id,
                        'product_id' => $product->product_id,
                        'product_type' => $product->product_type,
                        'brand' => $product->brand,
                        'model' => $product->model,
                        'quantity' => $product->quantity,
                        'unit_price' => number_format($product->unit_price, 2, '.', ''),
                        'partial_value' => number_format($product->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($product->profit_percentage, 3, '.', ''),
                        'profit' => number_format($product->profit, 2, '.', ''),
                        'total_value' => number_format($product->total_value, 2, '.', '')
                    ];
                }),
                'quotation_items' => $quotation->items->map(function ($item) {
                    return [
                        'item_id' => $item->item_id,
                        'quotation_id' => $item->quotation_id,
                        'description' => $item->description,
                        'item_type' => $item->item_type,
                        'quantity' => number_format($item->quantity, 2, '.', ''),
                        'unit' => $item->unit,
                        'unit_price' => number_format($item->unit_price, 2, '.', ''),
                        'partial_value' => number_format($item->partial_value, 2, '.', ''),
                        'profit_percentage' => number_format($item->profit_percentage, 3, '.', ''),
                        'profit' => number_format($item->profit, 2, '.', ''),
                        'total_value' => number_format($item->total_value, 2, '.', '')
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedResponse,
                'message' => 'Cotización actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 5. Eliminar Cotización
     */
    public function destroy($id): JsonResponse
    {
        try {
            $quotation = Quotation::find($id);
            if (!$quotation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            // Las relaciones se eliminan automáticamente por cascade
            $quotation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cotización eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 6. Cambiar Estado de Cotización
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status_id' => 'required|exists:quotation_statuses,status_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $quotation = Quotation::find($id);
            if (!$quotation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            $status = QuotationStatus::find($request->status_id);
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado no válido'
                ], 422);
            }

            $oldStatusId = $quotation->status_id;
            $quotation->update(['status_id' => $request->status_id]);

            // Verificar si se debe crear proyecto (estado "Contratada" ID 6)
            $projectCreated = null;
            $projectCreationInfo = [
                'should_create_project' => $request->status_id == 6,
                'was_just_created' => $oldStatusId != 6 && $request->status_id == 6,
                'project_already_exists' => false,
                'project_exists_including_soft_deleted' => false,
                'creation_attempted' => false,
                'creation_result' => null
            ];

            // Intentar crear proyecto si el estado es "Contratada" y no existe proyecto para esta cotización
            if ($request->status_id == 6) {
                \Log::info('El estado es "Contratada" para cotización #' . $quotation->quotation_id);
                
                // Verificar si existe algún proyecto, incluyendo soft deleted
                if (Project::where('quotation_id', $quotation->quotation_id)->exists()) {
                    $projectCreationInfo['project_exists_including_soft_deleted'] = true;
                }
                
                // Solo intentar crear si no existe un proyecto activo
                if (!Project::where('quotation_id', $quotation->quotation_id)->withoutTrashed()->exists()) {
                    \Log::info('No existe proyecto activo para cotización #' . $quotation->quotation_id . ', intentando crear uno');
                    $projectCreated = $this->createProjectFromQuotation($quotation);
                    $projectCreationInfo['creation_attempted'] = true;
                    $projectCreationInfo['creation_result'] = $projectCreated ? 'success' : 'failed';
                } else {
                    \Log::info('Ya existe proyecto activo para cotización #' . $quotation->quotation_id);
                    $projectCreationInfo['project_already_exists'] = true;
                }
            }

            $responseData = [
                'quotation_id' => $quotation->quotation_id,
                'status' => [
                    'status_id' => $status->status_id,
                    'name' => $status->name,
                    'description' => $status->description,
                    'color' => $status->color
                ],
                'updated_at' => $quotation->updated_at
            ];

            // Agregar información del proyecto si se creó
            if ($projectCreated) {
                $responseData['project_created'] = [
                    'project_id' => $projectCreated->id,
                    'project_name' => $projectCreated->name,
                    'status' => $projectCreated->currentState->name
                ];
            }

            // Agregar información de diagnóstico del proceso de creación de proyecto
            $responseData['project_creation_info'] = $projectCreationInfo;

            $message = 'Estado de cotización actualizado exitosamente';
            if ($projectCreated) {
                $message .= ' y proyecto creado automáticamente';
            } else if ($projectCreationInfo['should_create_project'] && !$projectCreated) {
                if ($projectCreationInfo['project_already_exists']) {
                    $message .= '. No se creó proyecto: ya existía uno para esta cotización.';
                } else if ($projectCreationInfo['creation_attempted'] && $projectCreationInfo['creation_result'] === 'failed') {
                    $message .= '. No se creó proyecto: error en la creación.';
                } else {
                    $message .= '. No se creó proyecto: ya existe un proyecto activo para esta cotización.';
                }
            }

            return response()->json([
                'success' => true,
                'data' => $responseData,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método auxiliar para obtener producto por tipo
     */
    private function getProduct($type, $id)
    {
        switch ($type) {
            case 'panel':
                return Panel::find($id);
            case 'inverter':
                return Inverter::find($id);
            case 'battery':
                return Battery::find($id);
            default:
                return null;
        }
    }

    /**
     * Crear proyecto automáticamente cuando la cotización se convierte en contratada
     */
    private function createProjectFromQuotation(Quotation $quotation)
    {
        try {
            // Verificar que no exista ya un proyecto activo para esta cotización
            if (Project::where('quotation_id', $quotation->quotation_id)->withoutTrashed()->exists()) {
                \Log::warning('Ya existe un proyecto activo para la cotización #' . $quotation->quotation_id);
                return null;
            }

            // Obtener el estado inicial "Preparación de Solicitud" (ID 1) para el proyecto
            $initialStatus = ProjectState::find(1);
            
            if (!$initialStatus) {
                // Si no existe el estado con ID 1, usar el primer estado disponible
                $initialStatus = ProjectState::first();
            }

            // Obtener la ubicación del cliente (departamento y ciudad)
            $department = $quotation->client->department ?? Department::first();
            $city = $quotation->client->city ?? City::first();

            // Crear el proyecto con todos los campos obligatorios
            $project = Project::create([
                'code' => 'PROY-' . str_pad($quotation->quotation_id, 6, '0', STR_PAD_LEFT), // Código único del proyecto
                'name' => $quotation->project_name, // Nombre del proyecto
                'description' => 'Proyecto creado automáticamente desde cotización #' . $quotation->quotation_id,
                'client_id' => $quotation->client_id,
                'department' => $quotation->client->department->name ?? 'Desconocido', // Departamento del cliente
                'municipality' => $quotation->client->city->name ?? 'Desconocido', // Municipio del cliente
                'address' => $quotation->client->address ?? 'Dirección no especificada', // Dirección
                'capacity_dc' => $quotation->power_kwp * 1.2, // Asumiendo un factor de 1.2 para DC
                'capacity_ac' => $quotation->power_kwp, // Potencia AC igual a la cotizada
                'number_panels' => $quotation->panel_count, // Número de paneles de la cotización
                'number_inverters' => 1, // Número de inversores
                'contract_value' => $quotation->total_value, // Valor del contrato basado en la cotización
                'start_date' => now(), // Fecha de inicio actual
                'estimated_completion_date' => now()->addMonths(3), // Fecha estimada (3 meses)
                'current_state_id' => $initialStatus->id, // Estado inicial del proyecto
                'progress_percentage' => 0, // Porcentaje de avance inicial

                // Campos adicionales de la cotización
                'quotation_id' => $quotation->quotation_id,
                'project_type' => $quotation->system_type,
                'inverter_manufacturer' => null, // Se puede obtener de los productos después
                'inverter_model' => null, // Se puede obtener de los productos después
                'responsible_commercial' => $quotation->user->name ?? null,
                'estimated_margin' => $quotation->profit_percentage * 100,
            ]);

            // Crear centro de costo automáticamente para el proyecto
            $costCenterCode = 'CC-' . $project->code;
            $costCenter = CostCenter::create([
                'code' => $costCenterCode,
                'name' => $project->name,
                'type' => 'Proyecto',
                'description' => 'Centro de costo para proyecto ' . $project->name,
                'responsible_user_id' => $quotation->user_id, // Usuario que creó la cotización
                'budget' => $quotation->total_value, // Presupuesto basado en el valor total de la cotización
                'status' => 'activo',
            ]);

            // Asignar el centro de costo al proyecto
            $project->update(['cost_center_id' => $costCenter->cost_center_id]);

            \Log::info('Proyecto creado exitosamente con ID: ' . $project->id . ' y centro de costo ID: ' . $costCenter->cost_center_id . ' para cotización #' . $quotation->quotation_id);
            
            // Cargar las relaciones para la respuesta
            $project->load(['currentState']);
            
            return $project;
            
        } catch (\Exception $e) {
            \Log::error('Error al crear proyecto para cotización #' . $quotation->quotation_id . ': ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * 7. Estadísticas de Cotizaciones
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $query = Quotation::query();
    
            // FILTRO DE SEGURIDAD: Usuarios comerciales solo ven sus propias cotizaciones
            $user = auth()->user();
            if ($user && $user->role && $user->role->slug === 'comercial') {
                $query->where('user_id', $user->id);
            }
    
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('project_name', 'like', "%{$search}%")
                      ->orWhereHas('client', function($clientQuery) use ($search) {
                          $clientQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('nic', 'like', "%{$search}%");
                      });
                });
            }
    
            if ($request->has('status_id')) {
                $query->where('status_id', $request->status_id);
            }
            if ($request->has('status')) {
                $query->whereHas('status', function ($statusQuery) use ($request) {
                    $statusQuery->where('name', $request->status);
                });
            }
            if ($request->has('client_type')) {
                $query->whereHas('client', function ($clientQuery) use ($request) {
                    $clientQuery->where('client_type', $request->client_type);
                });
            }
            if ($request->has('seller')) {
                $query->whereHas('user', function ($userQuery) use ($request) {
                    $userQuery->where('name', 'LIKE', '%' . $request->seller . '%');
                });
            }
    
            $total = $query->count();

            $byStatus = Quotation::select('status_id', \DB::raw('COUNT(*) as count'))
                ->groupBy('status_id')
                ->get()
                ->map(function ($row) {
                    $status = QuotationStatus::find($row->status_id);
                    return [
                        'status_id' => $row->status_id,
                        'name' => $status?->name,
                        'color' => $status?->color,
                        'count' => (int) $row->count,
                    ];
                });

            $sumTotal = Quotation::sum('total_value');
            $sumPower = Quotation::sum('power_kwp');

            $bySystemType = Quotation::select('system_type', \DB::raw('COUNT(*) as count'))
                ->groupBy('system_type')
                ->get()
                ->map(function ($row) {
                    return [
                        'system_type' => $row->system_type,
                        'count' => (int) $row->count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'sum_total_value' => (float) $sumTotal,
                    'sum_power_kwp' => (float) $sumPower,
                    'by_status' => $byStatus,
                    'by_system_type' => $bySystemType,
                ],
                'message' => 'Estadísticas de cotizaciones obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de cotizaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 8. Listar estados de cotización
     */
    public function getStatuses(): JsonResponse
    {
        try {
            $statuses = QuotationStatus::select('status_id', 'name', 'description', 'color')
                ->orderBy('status_id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $statuses,
                'message' => 'Estados de cotización obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estados de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 9. Generar PDF de cotización enviando datos a n8n y devolviendo PDF binario
     */
    public function generatePDF($id)
    {
        try {
            $quotation = Quotation::with([
                'client',
                'user',
                'status',
                'usedProducts',
                'items'
            ])->find($id);

            if (!$quotation) {
                \Log::warning('Intento de generar PDF para cotización no encontrada', ['quotation_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            \Log::info('Iniciando generación de PDF para cotización', [
                'quotation_id' => $quotation->quotation_id,
                'quotation_number' => $quotation->quotation_number,
                'client_name' => $quotation->client->name
            ]);

            // Enviar webhook a n8n y esperar respuesta con PDF binario
            $webhookResult = $this->sendQuotationWebhook($quotation);

            if (!$webhookResult['success']) {
                \Log::error('Error en webhook para generación de PDF', [
                    'quotation_id' => $quotation->quotation_id,
                    'error' => $webhookResult['error'] ?? 'Error desconocido'
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error al generar PDF: ' . ($webhookResult['error'] ?? 'Error desconocido'),
                    'error' => $webhookResult['error'] ?? 'Error en webhook'
                ], 500);
            }

            // Verificar que se recibió el contenido del PDF
            $pdfContent = $webhookResult['pdf_content'] ?? null;
            if (!$pdfContent) {
                \Log::error('Webhook exitoso pero sin contenido PDF', [
                    'quotation_id' => $quotation->quotation_id,
                    'webhook_result' => $webhookResult
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'PDF generado pero no se recibió el contenido del archivo'
                ], 500);
            }

            // Validar que el contenido sea un PDF válido
            if (!$this->isValidPdfContent($pdfContent)) {
                \Log::error('Contenido recibido no es un PDF válido', [
                    'quotation_id' => $quotation->quotation_id,
                    'content_length' => strlen($pdfContent),
                    'content_preview' => substr($pdfContent, 0, 100)
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo generado no es un PDF válido'
                ], 500);
            }

            // Nombre del archivo para descarga
            $filename = 'cotizacion_' . $quotation->quotation_number . '.pdf';

            \Log::info('PDF generado exitosamente', [
                'quotation_id' => $quotation->quotation_id,
                'filename' => $filename,
                'content_length' => strlen($pdfContent)
            ]);

            // Devolver PDF binario con headers optimizados para descarga
            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"; filename*=UTF-8\'\'' . rawurlencode($filename),
                'Content-Length' => strlen($pdfContent),
                'Content-Transfer-Encoding' => 'binary',
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
                'X-Frame-Options' => 'DENY',
                'X-XSS-Protection' => '1; mode=block'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error inesperado al generar PDF de cotización', [
                'quotation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 10. Generar PDF de cotización con PDFKit
     */
    public function generatePDFKit($id): JsonResponse
    {
        try {
            $quotation = Quotation::with([
                'client',
                'user',
                'status',
                'usedProducts',
                'items'
            ])->find($id);

            if (!$quotation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            // Esta es una implementación básica para PDFKit
            $pdfData = [
                'quotation_number' => $quotation->quotation_number,
                'project_name' => $quotation->project_name,
                'client_name' => $quotation->client->name,
                'client_email' => $quotation->client->email,
                'client_phone' => $quotation->client->phone,
                'total_value' => $quotation->total_value,
                'status' => $quotation->status->name,
                'created_at' => $quotation->created_at->format('d/m/Y'),
                'system_type' => $quotation->system_type,
                'power_kwp' => $quotation->power_kwp,
                'panel_count' => $quotation->panel_count
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'pdf_data' => $pdfData,
                    'url' => '/pdfs/cotizacion_' . $quotation->quotation_id . '_pdfkit.pdf',
                    'filename' => 'cotizacion_' . $quotation->quotation_number . '_pdfkit.pdf'
                ],
                'message' => 'PDFKit generado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDFKit de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 11. Generar PDF simple con detalles de la cotización
     */
    public function generateSimplePDF($id)
    {
        try {
            $quotation = Quotation::with([
                'client.department',
                'client.city',
                'user',
                'status',
                'usedProducts',
                'items'
            ])->find($id);

            if (!$quotation) {
                \Log::warning('Intento de generar PDF simple para cotización no encontrada', ['quotation_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

            \Log::info('Generando PDF simple para cotización', [
                'quotation_id' => $quotation->quotation_id,
                'quotation_number' => $quotation->quotation_number
            ]);

            // Crear PDF con DomPDF usando vista Blade
            $pdf = Pdf::loadView('pdf.quotation-details', compact('quotation'));

            // Configurar opciones del PDF
            $pdf->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => false,
                'isPhpEnabled' => true,
                'dpi' => 96,
                'defaultPaperSize' => 'a4',
                'defaultPaperOrientation' => 'portrait'
            ]);

            // Obtener el contenido binario del PDF usando output() en lugar de download()
            $pdfContent = $pdf->output();

            // Nombre del archivo
            $filename = 'detalles_cotizacion_' . $quotation->quotation_number . '.pdf';

            \Log::info('PDF simple generado exitosamente', [
                'quotation_id' => $quotation->quotation_id,
                'filename' => $filename,
                'content_length' => strlen($pdfContent)
            ]);

            // Devolver PDF como respuesta HTTP directa con headers correctos para descarga
            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"; filename*=UTF-8\'\'' . rawurlencode($filename),
                'Content-Length' => strlen($pdfContent),
                'Content-Transfer-Encoding' => 'binary',
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
                'X-Frame-Options' => 'DENY',
                'X-XSS-Protection' => '1; mode=block'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al generar PDF simple de cotización', [
                'quotation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF simple de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método auxiliar para obtener texto del tipo de producto
     */
    private function getProductTypeText(string $productType): string
    {
        $types = [
            'panel' => 'Panel Solar',
            'inverter' => 'Inversor',
            'battery' => 'Batería'
        ];

        return $types[$productType] ?? ucfirst($productType);
    }

    /**
     * Enviar webhook a n8n con datos calculados de la cotización y esperar respuesta con PDF binario
     */
    private function sendQuotationWebhook(Quotation $quotation): array
    {
        $maxRetries = 3;
        $retryDelay = 2; // segundos

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                \Log::info('Intento ' . $attempt . '/' . $maxRetries . ' de envío webhook para cotización #' . $quotation->quotation_id);

                // Variables de entrada según documentación
                $potencia_kwp = $quotation->power_kwp;
                $inversion_total = (int)$quotation->total_value;
                $tarifa_kwh = (int)($quotation->client->tarifa ?? 1100); // Default 1100 si no hay tarifa
                $ubicacion = $quotation->client->city ? $quotation->client->city->name : 'Bogotá';

                // Calcular generación mensual usando HSP
                $generacion_mensual = $this->calcularGeneracionMensual($potencia_kwp, $ubicacion);

                // Calcular proyección financiera
                $proyeccion_financiera = $this->calcularProyeccionFinanciera($generacion_mensual, $tarifa_kwh, $inversion_total);

                // Preparar datos del payload según especificación exacta
                $webhookData = [
                    "meta_info" => [
                        "numero_propuesta" => 'COT-' . date('Y') . '-' . str_pad($quotation->quotation_id, 3, '0', STR_PAD_LEFT),
                        "fecha_propuesta" => $quotation->created_at->format('d \d\e M \d\e Y', strtotime($quotation->created_at))
                    ],

                    "datos_cliente" => [
                        "nombre_cliente" => $quotation->client->name,
                        "ubicacion_proyecto" => ($quotation->client->city ? $quotation->client->city->name : 'N/A') .
                                              ', ' .
                                              ($quotation->client->department ? $quotation->client->department->name : 'N/A')
                    ],

                    "datos_tecnicos" => [
                        "tipo_sistema_txt" => $this->getSystemTypeText($quotation),
                        "potencia_kwp" => (string)$potencia_kwp,
                        "cantidad_paneles" => $quotation->panel_count,
                        "tipo_paneles" => $this->getPanelDescription($quotation),
                        "cantidad_inversor" => 1,
                        "tipo_inversor" => $this->getInverterDescription($quotation),
                        "cantidad_baterias" => $this->getBatteryCount($quotation),
                        "tipo_baterias" => $this->getBatteryDescription($quotation)
                    ],

                    "datos_graficas_raw" => [
                        "datos_mensuales_str" => implode(', ', $generacion_mensual),
                        "valor_inversion_raw" => $inversion_total,
                        "ahorro_5y_raw" => $proyeccion_financiera['ahorro_5y'],
                        "ahorro_10y_raw" => $proyeccion_financiera['ahorro_10y'],
                        "ahorro_15y_raw" => $proyeccion_financiera['ahorro_15y'],
                        "ahorro_20y_raw" => $proyeccion_financiera['ahorro_20y'],
                        "ahorro_25y_raw" => $proyeccion_financiera['ahorro_25y']
                    ],

                    "datos_financieros_display" => [
                        "generacion_promedio" => number_format($proyeccion_financiera['generacion_promedio'], 0, ',', '.'),
                        "tarifa_energia" => '$ ' . number_format($tarifa_kwh, 0, ',', '.'),
                        "ahorro_mensual_pesos" => '$ ' . number_format($proyeccion_financiera['ahorro_mensual'], 0, ',', '.'),
                        "ahorro_anual_pesos" => '$ ' . number_format($proyeccion_financiera['ahorro_anual'], 0, ',', '.'),
                        "ahorro_acumulado_25_anos" => $this->formatLargeNumber($proyeccion_financiera['ahorro_25y']),
                        "anos_retorno" => number_format($proyeccion_financiera['anos_retorno'], 1, ',', '.')
                    ],

                    "items_presupuesto" => $this->getBudgetItems($quotation),

                    "totales_cierre" => $this->getClosingTotals($quotation)
                ];

                // Enviar webhook a n8n y esperar respuesta con PDF binario
                $timeout = 60 + ($attempt - 1) * 30; // Incrementar timeout en reintentos
                $response = Http::timeout($timeout)->post('https://n8n.jhanky.online/webhook/propuesta', $webhookData);

                if ($response->successful()) {
                    $responseBody = $response->body();
                    $contentLength = strlen($responseBody);

                    \Log::info('✅ Webhook enviado exitosamente para cotización #' . $quotation->quotation_id, [
                        'attempt' => $attempt,
                        'content_length' => $contentLength,
                        'content_type' => $response->header('Content-Type')
                    ]);

                    // Verificar que la respuesta no sea JSON de error (solo primeros bytes, sin modificar contenido binario)
                    $firstBytes = substr($responseBody, 0, 1);
                    $lastBytes = substr($responseBody, -1, 1);

                    if (($firstBytes === '{' && $lastBytes === '}') ||
                        ($firstBytes === '[' && $lastBytes === ']')) {
                        \Log::warning('Respuesta del webhook parece ser JSON en lugar de PDF binario', [
                            'quotation_id' => $quotation->quotation_id,
                            'response_preview' => substr($responseBody, 0, 500)
                        ]);

                        // Intentar parsear como JSON para obtener mensaje de error
                        try {
                            $errorData = json_decode($responseBody, true);
                            $errorMessage = $errorData['message'] ?? $errorData['error'] ?? 'Error desconocido en webhook';
                        } catch (\Exception $e) {
                            $errorMessage = 'Respuesta JSON inválida del webhook';
                        }

                        if ($attempt < $maxRetries) {
                            \Log::info('Reintentando webhook en ' . $retryDelay . ' segundos...');
                            sleep($retryDelay);
                            continue;
                        }

                        return [
                            'success' => false,
                            'error' => $errorMessage
                        ];
                    }

                    return [
                        'success' => true,
                        'pdf_content' => $responseBody,
                        'content_type' => $response->header('Content-Type') ?? 'application/pdf',
                        'content_length' => $response->header('Content-Length') ?? $contentLength
                    ];
                } else {
                    $errorMsg = 'Error HTTP ' . $response->status() . ': ' . $response->body();
                    \Log::warning('Error en webhook intento ' . $attempt . '/' . $maxRetries . ': ' . $errorMsg);

                    if ($attempt < $maxRetries) {
                        \Log::info('Reintentando webhook en ' . $retryDelay . ' segundos...');
                        sleep($retryDelay);
                        continue;
                    }

                    return [
                        'success' => false,
                        'error' => $errorMsg
                    ];
                }

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                \Log::warning('Error de conexión en intento ' . $attempt . '/' . $maxRetries . ': ' . $e->getMessage());

                if ($attempt < $maxRetries) {
                    \Log::info('Reintentando webhook en ' . $retryDelay . ' segundos...');
                    sleep($retryDelay);
                    continue;
                }

                return [
                    'success' => false,
                    'error' => 'Error de conexión con el servicio de generación de PDF'
                ];
            } catch (\Illuminate\Http\Client\RequestTimeoutException $e) {
                \Log::warning('Timeout en intento ' . $attempt . '/' . $maxRetries . ': ' . $e->getMessage());

                if ($attempt < $maxRetries) {
                    \Log::info('Reintentando webhook por timeout en ' . $retryDelay . ' segundos...');
                    sleep($retryDelay);
                    continue;
                }

                return [
                    'success' => false,
                    'error' => 'Timeout al generar el PDF. El servicio está tardando demasiado en responder.'
                ];
            } catch (\Exception $e) {
                \Log::error('Error inesperado en intento ' . $attempt . '/' . $maxRetries . ': ' . $e->getMessage());

                if ($attempt < $maxRetries) {
                    \Log::info('Reintentando webhook por error inesperado en ' . $retryDelay . ' segundos...');
                    sleep($retryDelay);
                    continue;
                }

                return [
                    'success' => false,
                    'error' => 'Error inesperado al preparar los datos: ' . $e->getMessage()
                ];
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        return [
            'success' => false,
            'error' => 'No se pudo generar el PDF después de ' . $maxRetries . ' intentos'
        ];
    }

    /**
     * Métodos auxiliares para obtener información de productos
     */
    private function getPanelDescription(Quotation $quotation): string
    {
        $panelProduct = $quotation->usedProducts->where('product_type', 'panel')->first();
        if ($panelProduct) {
            $panel = Panel::find($panelProduct->product_id);
            return $panel ? ($panel->brand . ' ' . $panel->model . ' ' . $panel->power . 'W') : 'Paneles Solares';
        }
        return 'Paneles Solares';
    }

    private function getInverterDescription(Quotation $quotation): string
    {
        $inverterProduct = $quotation->usedProducts->where('product_type', 'inverter')->first();
        if ($inverterProduct) {
            $inverter = Inverter::find($inverterProduct->product_id);
            return $inverter ? ($inverter->brand . ' ' . $inverter->model . ' ' . $inverter->power . 'kW') : 'Inversor Híbrido';
        }
        return 'Inversor Híbrido';
    }

    private function getBatteryCount(Quotation $quotation): int
    {
        $batteryProduct = $quotation->usedProducts->where('product_type', 'battery')->first();
        return $batteryProduct ? $batteryProduct->quantity : 0;
    }

    private function getBatteryDescription(Quotation $quotation): string
    {
        $batteryProduct = $quotation->usedProducts->where('product_type', 'battery')->first();
        if ($batteryProduct) {
            $battery = Battery::find($batteryProduct->product_id);
            return $battery ? ('Litio ' . $battery->capacity . 'Ah (' . $battery->voltage . 'V)') : 'Batería de Litio';
        }
        return 'Batería de Litio';
    }

    private function generateMonthlyDataString(Quotation $quotation): string
    {
        // Generar datos mensuales simulados basados en la potencia del sistema
        $monthlyKwh = $quotation->power_kwp * 30 * 4.5; // Estimación simplificada
        $monthlyData = [];

        for ($i = 0; $i < 12; $i++) {
            // Variación estacional (±15%)
            $variation = 1 + (sin(deg2rad($i * 30)) * 0.15);
            $monthlyData[] = (int)($monthlyKwh * $variation);
        }

        return implode(', ', $monthlyData);
    }

    private function getPanelUnitPrice(Quotation $quotation): float
    {
        $panelProduct = $quotation->usedProducts->where('product_type', 'panel')->first();
        return $panelProduct ? $panelProduct->unit_price : 0;
    }

    private function getPanelTotalPrice(Quotation $quotation): float
    {
        $panelProduct = $quotation->usedProducts->where('product_type', 'panel')->first();
        return $panelProduct ? $panelProduct->total_value : 0;
    }

    private function getInverterUnitPrice(Quotation $quotation): float
    {
        $inverterProduct = $quotation->usedProducts->where('product_type', 'inverter')->first();
        return $inverterProduct ? $inverterProduct->unit_price : 0;
    }

    private function getInverterTotalPrice(Quotation $quotation): float
    {
        $inverterProduct = $quotation->usedProducts->where('product_type', 'inverter')->first();
        return $inverterProduct ? $inverterProduct->total_value : 0;
    }

    private function getBatteryUnitPrice(Quotation $quotation): float
    {
        $batteryProduct = $quotation->usedProducts->where('product_type', 'battery')->first();
        return $batteryProduct ? $batteryProduct->unit_price : 0;
    }

    private function getBatteryTotalPrice(Quotation $quotation): float
    {
        $batteryProduct = $quotation->usedProducts->where('product_type', 'battery')->first();
        return $batteryProduct ? $batteryProduct->total_value : 0;
    }

    /**
     * Calcular generación mensual usando Factor K (según cálculos.md)
     * Factor K: 133.75 kWh generados por cada kW instalado al mes
     */
    private function calcularGeneracionMensual(float $potencia_kwp, string $ubicacion): array
    {
        // Factor K calibrado para Atlántico/Caribe (según cálculos.md)
        $factor_k = 133.75;

        // Generación mensual constante (sin variaciones estacionales)
        $generacion_mensual_kwh = $potencia_kwp * $factor_k;

        // Retornar array con el mismo valor para los 12 meses
        // Esto es diferente al HSP porque usa un promedio constante
        return array_fill(0, 12, (int)$generacion_mensual_kwh);
    }

    /**
     * Calcular proyección financiera con inflación energética del 5%
     */
    private function calcularProyeccionFinanciera(array $generacion_mensual, int $tarifa_kwh, int $inversion_total): array
    {
        $generacion_anual = array_sum($generacion_mensual);
        $generacion_promedio = $generacion_anual / 12;

        // Ahorro inicial (sin inflación)
        $ahorro_anual_inicial = $generacion_anual * $tarifa_kwh;
        $ahorro_mensual = $ahorro_anual_inicial / 12;

        // Calcular ahorro acumulado por años con inflación del 5%
        $ahorro_acumulado = 0;
        $anos_retorno = 0;
        $factor_inflacion = 1.05; // 5% anual

        for ($year = 1; $year <= 25; $year++) {
            $ahorro_anual = $ahorro_anual_inicial * pow($factor_inflacion, $year - 1);
            $ahorro_acumulado += $ahorro_anual;

            // Calcular retorno de inversión
            if ($ahorro_acumulado >= $inversion_total && $anos_retorno === 0) {
                $ahorro_anterior = $ahorro_acumulado - $ahorro_anual;
                $ahorro_restante = $inversion_total - $ahorro_anterior;
                $fraccion_anual = $ahorro_restante / $ahorro_anual;
                $anos_retorno = ($year - 1) + $fraccion_anual;
            }
        }

        return [
            'generacion_promedio' => $generacion_promedio,
            'ahorro_mensual' => $ahorro_mensual,
            'ahorro_anual' => $ahorro_anual_inicial,
            'ahorro_5y' => (int)($ahorro_anual_inicial * ((pow($factor_inflacion, 5) - 1) / ($factor_inflacion - 1))),
            'ahorro_10y' => (int)($ahorro_anual_inicial * ((pow($factor_inflacion, 10) - 1) / ($factor_inflacion - 1))),
            'ahorro_15y' => (int)($ahorro_anual_inicial * ((pow($factor_inflacion, 15) - 1) / ($factor_inflacion - 1))),
            'ahorro_20y' => (int)($ahorro_anual_inicial * ((pow($factor_inflacion, 20) - 1) / ($factor_inflacion - 1))),
            'ahorro_25y' => (int)$ahorro_acumulado,
            'anos_retorno' => $anos_retorno > 0 ? $anos_retorno : 25.0
        ];
    }

    /**
     * Obtener texto descriptivo del tipo de sistema
     */
    private function getSystemTypeText(Quotation $quotation): string
    {
        $systemTypes = [
            'On-grid' => 'Sistema Solar Conectado a Red',
            'Off-grid' => 'Sistema Solar Autónomo',
            'Híbrido' => 'Sistema Solar Híbrido',
            'Interconectado' => 'Sistema Solar Interconectado'
        ];

        return $systemTypes[$quotation->system_type] ?? 'Sistema Solar Fotovoltaico';
    }

    /**
     * Formatear números grandes (millones)
     */
    private function formatLargeNumber(float $number): string
    {
        if ($number >= 1000000) {
            return number_format($number / 1000000, 1, ',', '.') . ' Millones';
        }
        return '$ ' . number_format($number, 0, ',', '.');
    }

    /**
     * Obtener items del presupuesto formateados
     */
    private function getBudgetItems(Quotation $quotation): array
    {
        return [
            "v_unit_paneles" => '$ ' . number_format($this->getPanelUnitPrice($quotation), 0, ',', '.'),
            "v_total_paneles" => '$ ' . number_format($this->getPanelTotalPrice($quotation), 0, ',', '.'),
            "v_unit_inversor" => '$ ' . number_format($this->getInverterUnitPrice($quotation), 0, ',', '.'),
            "v_total_inversor" => '$ ' . number_format($this->getInverterTotalPrice($quotation), 0, ',', '.'),
            "v_unit_baterias" => '$ ' . number_format($this->getBatteryUnitPrice($quotation), 0, ',', '.'),
            "v_total_baterias" => '$ ' . number_format($this->getBatteryTotalPrice($quotation), 0, ',', '.'),
            "v_total_estructura" => '$ ' . number_format($quotation->subtotal * 0.1, 0, ',', '.'), // 10% estimado
            "v_total_material" => '$ ' . number_format($quotation->subtotal * 0.15, 0, ',', '.'), // 15% estimado
            "v_total_protecciones" => '$ ' . number_format($quotation->subtotal * 0.05, 0, ',', '.'), // 5% estimado
            "v_total_mo" => '$ ' . number_format($quotation->subtotal * 0.08, 0, ',', '.'), // 8% estimado
            "v_total_ing" => '$ ' . number_format($quotation->subtotal * 0.12, 0, ',', '.')  // 12% estimado
        ];
    }

    /**
     * Obtener totales finales del proyecto
     */
    private function getClosingTotals(Quotation $quotation): array
    {
        return [
            "subtotal" => '$ ' . number_format($quotation->subtotal, 0, ',', '.'),
            "imprevistos_valor" => '$ ' . number_format($quotation->contingency, 0, ',', '.'),
            "admin_valor" => '$ ' . number_format($quotation->administration, 0, ',', '.'),
            "utilidad_valor" => '$ ' . number_format($quotation->profit, 0, ',', '.'),
            "iva_utilidad_valor" => '$ ' . number_format($quotation->profit_iva, 0, ',', '.'),
            "subtotal_3_valor" => '$ ' . number_format($quotation->subtotal3, 0, ',', '.'),
            "retenciones_valor" => '$ ' . number_format($quotation->withholdings, 0, ',', '.'),
            "total_proyecto" => '$ ' . number_format($quotation->total_value, 0, ',', '.')
        ];
    }

    /**
     * Validar que el contenido binario sea un PDF válido
     */
    private function isValidPdfContent(string $content): bool
    {
        // Verificar tamaño mínimo (un PDF válido debe tener al menos algunos bytes)
        if (strlen($content) < 100) {
            \Log::warning('Contenido PDF demasiado pequeño', ['size' => strlen($content)]);
            return false;
        }

        // Verificar que comience con la firma PDF estándar
        if (!str_starts_with($content, '%PDF-')) {
            \Log::warning('Contenido no comienza con firma PDF', ['starts_with' => substr($content, 0, 10)]);
            return false;
        }

        // Verificar que termine con %%EOF (sin usar trim() que puede corromper datos binarios)
        $contentLength = strlen($content);
        if ($contentLength < 5 || substr($content, -5) !== '%%EOF') {
            \Log::warning('Contenido no termina con %%EOF', ['ends_with' => substr($content, -10)]);
            return false;
        }

        // Verificar que no sea JSON (respuesta de error del webhook) - solo verificar primeros y últimos bytes
        $firstByte = $content[0] ?? '';
        $lastByte = $content[$contentLength - 1] ?? '';

        if (($firstByte === '{' && $lastByte === '}') ||
            ($firstByte === '[' && $lastByte === ']')) {
            \Log::warning('Contenido parece ser JSON en lugar de PDF', ['content_preview' => substr($content, 0, 200)]);
            return false;
        }

        // Verificar que contenga objetos PDF básicos
        if (!str_contains($content, 'obj') || !str_contains($content, 'endobj')) {
            \Log::warning('Contenido no contiene objetos PDF válidos');
            return false;
        }

        \Log::info('Validación PDF exitosa', ['size' => strlen($content)]);
        return true;
    }
}
