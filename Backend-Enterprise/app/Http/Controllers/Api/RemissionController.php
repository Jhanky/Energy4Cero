<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Remission;
use App\Models\RemissionItem;
use App\Models\Material;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class RemissionController extends Controller
{
    /**
     * Listar remisiones
     */
    public function index(Request $request)
    {
        try {
            $query = Remission::with(['project', 'user', 'items.material']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('code', 'like', "%{$search}%")
                      ->orWhere('receiver_name', 'like', "%{$search}%")
                      ->orWhereHas('project', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            }

            if ($request->filled('project_id')) {
                $query->where('project_id', $request->project_id);
            }

            $perPage = $request->get('per_page', 15);
            $remissions = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'remissions' => $remissions->items(),
                    'pagination' => [
                        'current_page' => $remissions->currentPage(),
                        'per_page' => $remissions->perPage(),
                        'total' => $remissions->total(),
                        'last_page' => $remissions->lastPage(),
                    ]
                ],
                'message' => 'Remisiones obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener remisiones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear remisión
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'receiver_name' => 'required|string|max:255',
                'date' => 'required|date',
                'items' => 'required|array|min:1',
                'items.*.material_id' => 'required|exists:materials,id',
                'items.*.quantity' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            return DB::transaction(function () use ($request) {
                // Validar stock primero
                foreach ($request->items as $item) {
                    $material = Material::find($item['material_id']);
                    if ($material->quantity < $item['quantity']) {
                        throw new \Exception("Stock insuficiente para el material: {$material->description}. Disponible: {$material->quantity}");
                    }
                }

                // Generar código
                $count = Remission::count() + 1;
                $code = 'REM-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

                $remission = Remission::create([
                    'code' => $code,
                    'project_id' => $request->project_id,
                    'user_id' => Auth::id() ?? 1, // Fallback para dev si no hay auth
                    'receiver_name' => $request->receiver_name,
                    'date' => $request->date,
                    'notes' => $request->notes,
                    'status' => 'completed'
                ]);

                foreach ($request->items as $itemData) {
                    $material = Material::find($itemData['material_id']);
                    
                    // Crear item
                    RemissionItem::create([
                        'remission_id' => $remission->id,
                        'material_id' => $material->id,
                        'quantity' => $itemData['quantity'],
                        'notes' => $itemData['notes'] ?? null
                    ]);

                    // Descontar stock
                    $material->decrement('quantity', $itemData['quantity']);

                    // Registrar transacción
                    InventoryTransaction::create([
                        'material_id' => $material->id,
                        'type' => 'remission',
                        'quantity' => -$itemData['quantity'], // Negativo porque sale
                        'reference_type' => Remission::class,
                        'reference_id' => $remission->id,
                        'description' => "Salida por remisión {$code} al proyecto",
                        'user_id' => Auth::id() ?? 1
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data' => ['remission' => $remission->load('items')],
                    'message' => 'Remisión creada exitosamente'
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear remisión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver detalle de remisión
     */
    public function show($id)
    {
        try {
            $remission = Remission::with(['project', 'user', 'items.material'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => ['remission' => $remission],
                'message' => 'Remisión obtenida exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Remisión no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}
