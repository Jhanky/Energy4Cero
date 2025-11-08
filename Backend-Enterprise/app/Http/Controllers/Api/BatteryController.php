<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Battery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class BatteryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Battery::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%");
                });
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->is_active === 'true');
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $batteries = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'batteries' => $batteries->items(),
                    'pagination' => [
                        'current_page' => $batteries->currentPage(),
                        'per_page' => $batteries->perPage(),
                        'total' => $batteries->total(),
                        'last_page' => $batteries->lastPage(),
                        'from' => $batteries->firstItem(),
                        'to' => $batteries->lastItem(),
                    ],
                ],
                'message' => 'Baterías obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener baterías',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:batteries,name',
                'model' => 'required|string|max:255|unique:batteries,model',
                'type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'ah_capacity' => 'required|numeric|min:0',
                'voltage' => 'required|numeric|min:0',
                'technical_sheet' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB PDF
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $batteryData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                $path = $request->file('technical_sheet')->store('technical_sheets/batteries', 'public');
                $batteryData['technical_sheet_path'] = $path;
            }

            $battery = Battery::create($batteryData);

            return response()->json([
                'success' => true,
                'data' => $battery,
                'message' => 'Batería creada exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la batería',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $battery = Battery::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $battery,
                'message' => 'Batería obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Batería no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $battery = Battery::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:batteries,name,' . $id . ',battery_id',
                'model' => 'required|string|max:255|unique:batteries,model,' . $id . ',battery_id',
                'type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'ah_capacity' => 'required|numeric|min:0',
                'voltage' => 'required|numeric|min:0',
                'technical_sheet' => 'nullable|file|mimes:pdf|max:10240',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $batteryData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                // Eliminar ficha técnica antigua si existe
                if ($battery->technical_sheet_path) {
                    Storage::disk('public')->delete($battery->technical_sheet_path);
                }
                $path = $request->file('technical_sheet')->store('technical_sheets/batteries', 'public');
                $batteryData['technical_sheet_path'] = $path;
            } elseif ($request->input('technical_sheet_path') === null) {
                // Si se envía technical_sheet_path como null, significa que se quiere eliminar la ficha técnica existente
                if ($battery->technical_sheet_path) {
                    Storage::disk('public')->delete($battery->technical_sheet_path);
                }
                $batteryData['technical_sheet_path'] = null;
            }

            $battery->update($batteryData);

            return response()->json([
                'success' => true,
                'data' => $battery,
                'message' => 'Batería actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la batería',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $battery = Battery::findOrFail($id);

            // Eliminar ficha técnica antigua si existe
            if ($battery->technical_sheet_path) {
                Storage::disk('public')->delete($battery->technical_sheet_path);
            }

            $battery->delete();

            return response()->json([
                'success' => true,
                'message' => 'Batería eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la batería',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de una batería
     */
    public function toggleStatus(string $id)
    {
        try {
            $battery = Battery::findOrFail($id);
            $battery->is_active = !$battery->is_active;
            $battery->save();

            return response()->json([
                'success' => true,
                'data' => $battery,
                'message' => $battery->is_active ? 'Batería activada exitosamente' : 'Batería desactivada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de la batería',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for batteries.
     */
    public function statistics()
    {
        try {
            $total = Battery::count();
            $averagePrice = Battery::avg('price');

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'average_price' => round($averagePrice),
                ],
                'message' => 'Estadísticas de baterías obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de baterías',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}