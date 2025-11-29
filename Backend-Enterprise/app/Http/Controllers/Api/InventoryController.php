<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    /**
     * Adicionar stock a un material
     */
    public function addStock(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'material_id' => 'required|exists:materials,id',
                'quantity' => 'required|numeric|min:0.01',
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
                $material = Material::findOrFail($request->material_id);

                // Incrementar stock
                $material->increment('quantity', $request->quantity);

                // Registrar transacción
                $transaction = InventoryTransaction::create([
                    'material_id' => $material->id,
                    'type' => 'entry',
                    'quantity' => $request->quantity,
                    'description' => $request->notes ?? 'Entrada de inventario manual',
                    'user_id' => Auth::id() ?? 1
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'material' => $material,
                        'transaction' => $transaction
                    ],
                    'message' => 'Stock adicionado exitosamente'
                ]);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al adicionar stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de transacciones de un material
     */
    public function history($materialId)
    {
        try {
            $transactions = InventoryTransaction::with(['user', 'reference'])
                ->where('material_id', $materialId)
                ->latest()
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions' => $transactions->items(),
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'per_page' => $transactions->perPage(),
                        'total' => $transactions->total(),
                        'last_page' => $transactions->lastPage(),
                    ]
                ],
                'message' => 'Historial obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
