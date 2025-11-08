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
use App\Models\ProjectStatus;
use App\Models\Department;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class QuotationController extends Controller
{
    /**
     * 1. Listar Cotizaciones
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Quotation::with([
                'client:client_id,name,nic,client_type,department_id,city_id',
                'user:id,name,email'
            ]);

            // Filtros
            if ($request->has('status_id')) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->has('system_type')) {
                $query->where('system_type', $request->system_type);
            }

            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
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

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $quotations = $query->paginate($request->get('per_page', 15));

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
            
            return response()->json($formattedResponse, 201);
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
        try {
            $quotation = Quotation::find($id);
            if (!$quotation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cotización no encontrada'
                ], 404);
            }

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
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar solo los campos enviados
            $quotation->update($request->only([
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
            ]));

            // Actualizar productos utilizados si se enviaron
            if ($request->has('used_products')) {
                foreach ($request->used_products as $productData) {
                    if (isset($productData['used_product_id'])) {
                        $usedProduct = UsedProduct::find($productData['used_product_id']);
                        if ($usedProduct && $usedProduct->quotation_id == $quotation->quotation_id) {
                            $usedProduct->update([
                                'quantity' => $productData['quantity'] ?? $usedProduct->quantity,
                                'unit_price' => $productData['unit_price'] ?? $usedProduct->unit_price,
                                'profit_percentage' => $productData['profit_percentage'] ?? $usedProduct->profit_percentage,
                                'partial_value' => $productData['partial_value'] ?? $usedProduct->partial_value,
                                'profit' => $productData['profit'] ?? $usedProduct->profit,
                                'total_value' => $productData['total_value'] ?? $usedProduct->total_value,
                                'brand' => $productData['brand'] ?? $usedProduct->brand,
                                'model' => $productData['model'] ?? $usedProduct->model,
                            ]);
                        }
                    }
                }
            }

            // Actualizar items si se enviaron
            if ($request->has('items')) {
                foreach ($request->items as $itemData) {
                    if (isset($itemData['item_id'])) {
                        $item = QuotationAdditionalItem::find($itemData['item_id']);
                        if ($item && $item->quotation_id == $quotation->quotation_id) {
                            $item->update([
                                'description' => $itemData['description'] ?? $item->description,
                                'item_type' => $itemData['item_type'] ?? $item->item_type,
                                'quantity' => $itemData['quantity'] ?? $item->quantity,
                                'unit' => $itemData['unit'] ?? $item->unit,
                                'unit_price' => $itemData['unit_price'] ?? $item->unit_price,
                                'profit_percentage' => $itemData['profit_percentage'] ?? $item->profit_percentage,
                                'partial_value' => $itemData['partial_value'] ?? $item->partial_value,
                                'profit' => $itemData['profit'] ?? $item->profit,
                                'total_value' => $itemData['total_value'] ?? $item->total_value,
                            ]);
                        }
                    }
                }
            }

            // Cargar datos actualizados para la respuesta
            $quotation->load(['client', 'user']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'quotation_id' => $quotation->quotation_id,
                    'client_id' => $quotation->client_id,
                    'user_id' => $quotation->user_id,
                    'project_name' => $quotation->project_name,
                    'system_type' => $quotation->system_type,
                    'power_kwp' => $quotation->power_kwp,
                    'panel_count' => $quotation->panel_count,
                    'requires_financing' => $quotation->requires_financing,
                    'profit_percentage' => $quotation->profit_percentage,
                    'iva_profit_percentage' => $quotation->iva_profit_percentage,
                    'commercial_management_percentage' => $quotation->commercial_management_percentage,
                    'administration_percentage' => $quotation->administration_percentage,
                    'contingency_percentage' => $quotation->contingency_percentage,
                    'withholding_percentage' => $quotation->withholding_percentage,
                    'status_id' => $quotation->status_id,
                    'subtotal' => $quotation->subtotal,
                    'profit' => $quotation->profit,
                    'profit_iva' => $quotation->profit_iva,
                    'commercial_management' => $quotation->commercial_management,
                    'administration' => $quotation->administration,
                    'contingency' => $quotation->contingency,
                    'withholdings' => $quotation->withholdings,
                    'total_value' => $quotation->total_value,
                    'subtotal2' => $quotation->subtotal2,
                    'subtotal3' => $quotation->subtotal3,
                    'updated_at' => $quotation->updated_at,
                    'used_products_count' => 0, // Por ahora hasta que se creen las tablas
                    'items_count' => 0
                ],
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

            // Crear proyecto automáticamente si el estado cambió a "Contratada" (ID 5)
            $projectCreated = null;
            if ($oldStatusId != 5 && $request->status_id == 5) {
                $projectCreated = $this->createProjectFromQuotation($quotation);
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
                    'project_id' => $projectCreated->project_id,
                    'project_name' => $projectCreated->project_name,
                    'status' => $projectCreated->status->name
                ];
            }

            $message = 'Estado de cotización actualizado exitosamente';
            if ($projectCreated) {
                $message .= ' y proyecto creado automáticamente';
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
            // Verificar que no exista ya un proyecto para esta cotización
            if (Project::where('quotation_id', $quotation->quotation_id)->exists()) {
                \Log::warning('Ya existe un proyecto para la cotización #' . $quotation->quotation_id);
                return null;
            }

            // Obtener el estado "Activo" para el proyecto
            $initialStatus = ProjectStatus::where('name', 'Activo')->first();
            
            if (!$initialStatus) {
                // Si no existe el estado, usar el primero disponible
                $initialStatus = ProjectStatus::first();
            }

            // Obtener la ubicación del cliente (departamento y ciudad)
            $department = $quotation->client->department ?? Department::first();
            $city = $quotation->client->city ?? City::first();

            // Crear el proyecto
            $project = Project::create([
                'quotation_id' => $quotation->quotation_id,
                'client_id' => $quotation->client_id,
                'department_id' => $department ? $department->department_id : null,
                'city_id' => $city ? $city->city_id : null,
                'status_id' => $initialStatus->status_id,
                'project_name' => $quotation->project_name,
                'start_date' => now(),
                'project_manager_id' => $quotation->user_id, // El usuario que creó la cotización será el gerente inicial
                'notes' => 'Proyecto creado automáticamente al contratar la cotización #' . $quotation->quotation_id . '. Pendiente visita técnica para geolocalización.',
                // Los campos de georreferenciación se actualizarán después mediante visita técnica
            ]);

            \Log::info('Proyecto creado exitosamente con ID: ' . $project->project_id . ' para cotización #' . $quotation->quotation_id);
            
            // Cargar las relaciones para la respuesta
            $project->load(['status']);
            
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
    public function statistics(Request $request): JsonResponse
    {
        try {
            $total = Quotation::count();

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
     * 9. Generar PDF de cotización
     */
    public function generatePDF($id): JsonResponse
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

            // Esta es una implementación básica - en un entorno real, usarías una biblioteca como DomPDF o similar
            $pdfData = [
                'quotation_number' => $quotation->quotation_number,
                'project_name' => $quotation->project_name,
                'client_name' => $quotation->client->name,
                'client_email' => $quotation->client->email,
                'client_phone' => $quotation->client->phone,
                'total_value' => $quotation->total_value,
                'status' => $quotation->status->name,
                'created_at' => $quotation->created_at->format('d/m/Y'),
                'items' => $quotation->items->map(function($item) {
                    return [
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_value' => $item->total_value
                    ];
                }),
                'used_products' => $quotation->usedProducts->map(function($product) {
                    return [
                        'product_type' => $product->product_type,
                        'quantity' => $product->quantity,
                        'unit_price' => $product->unit_price,
                        'total_value' => $product->total_value
                    ];
                })
            ];

            // En una implementación real, aquí generarías el PDF y devolverías la URL
            return response()->json([
                'success' => true,
                'data' => [
                    'pdf_data' => $pdfData,
                    'url' => '/pdfs/cotizacion_' . $quotation->quotation_id . '.pdf',
                    'filename' => 'cotizacion_' . $quotation->quotation_number . '.pdf'
                ],
                'message' => 'PDF generado exitosamente'
            ]);

        } catch (\Exception $e) {
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
}
