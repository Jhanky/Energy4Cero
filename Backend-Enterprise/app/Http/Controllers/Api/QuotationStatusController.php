<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuotationStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class QuotationStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $statuses = QuotationStatus::all();
            
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50|unique:quotation_statuses,name',
                'description' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:20',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $status = QuotationStatus::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $status,
                'message' => 'Estado de cotización creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear estado de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        try {
            $status = QuotationStatus::find($id);
            
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de cotización no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $status,
                'message' => 'Estado de cotización obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estado de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $status = QuotationStatus::find($id);
            
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de cotización no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:50|unique:quotation_statuses,name,' . $id . ',status_id',
                'description' => 'sometimes|string|max:255',
                'color' => 'sometimes|string|max:20',
                'is_active' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $status->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $status,
                'message' => 'Estado de cotización actualizado exitosamente'
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
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $status = QuotationStatus::find($id);
            
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estado de cotización no encontrado'
                ], 404);
            }

            // Verificar si hay cotizaciones asociadas
            if ($status->quotations()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el estado porque tiene cotizaciones asociadas'
                ], 422);
            }

            $status->delete();

            return response()->json([
                'success' => true,
                'message' => 'Estado de cotización eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar estado de cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
