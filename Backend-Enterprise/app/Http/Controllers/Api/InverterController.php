<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class InverterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Inverter::query();

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
            $inverters = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'inverters' => $inverters->items(),
                    'pagination' => [
                        'current_page' => $inverters->currentPage(),
                        'per_page' => $inverters->perPage(),
                        'total' => $inverters->total(),
                        'last_page' => $inverters->lastPage(),
                        'from' => $inverters->firstItem(),
                        'to' => $inverters->lastItem(),
                    ],
                ],
                'message' => 'Inversores obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener inversores',
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
                'name' => 'required|string|max:255|unique:inverters,name',
                'model' => 'required|string|max:255|unique:inverters,model',
                'power_output_kw' => 'required|numeric|min:0',
                'grid_type' => 'required|string|max:255',
                'system_type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
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

            $inverterData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                $path = $request->file('technical_sheet')->store('technical_sheets/inverters', 'public');
                $inverterData['technical_sheet_path'] = $path;
            }

            $inverter = Inverter::create($inverterData);

            return response()->json([
                'success' => true,
                'data' => $inverter,
                'message' => 'Inversor creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el inversor',
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
            $inverter = Inverter::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $inverter,
                'message' => 'Inversor obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Inversor no encontrado',
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
            $inverter = Inverter::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:inverters,name,' . $id . ',inverter_id',
                'model' => 'required|string|max:255|unique:inverters,model,' . $id . ',inverter_id',
                'power_output_kw' => 'required|numeric|min:0',
                'grid_type' => 'required|string|max:255',
                'system_type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
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

            $inverterData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                // Eliminar ficha técnica antigua si existe
                if ($inverter->technical_sheet_path) {
                    Storage::disk('public')->delete($inverter->technical_sheet_path);
                }
                $path = $request->file('technical_sheet')->store('technical_sheets/inverters', 'public');
                $inverterData['technical_sheet_path'] = $path;
            } elseif ($request->input('technical_sheet_path') === null) {
                // Si se envía technical_sheet_path como null, significa que se quiere eliminar la ficha técnica existente
                if ($inverter->technical_sheet_path) {
                    Storage::disk('public')->delete($inverter->technical_sheet_path);
                }
                $inverterData['technical_sheet_path'] = null;
            }

            $inverter->update($inverterData);

            return response()->json([
                'success' => true,
                'data' => $inverter,
                'message' => 'Inversor actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el inversor',
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
            $inverter = Inverter::findOrFail($id);

            // Eliminar ficha técnica antigua si existe
            if ($inverter->technical_sheet_path) {
                Storage::disk('public')->delete($inverter->technical_sheet_path);
            }

            $inverter->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inversor eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el inversor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un inversor
     */
    public function toggleStatus(string $id)
    {
        try {
            $inverter = Inverter::findOrFail($id);
            $inverter->is_active = !$inverter->is_active;
            $inverter->save();

            return response()->json([
                'success' => true,
                'data' => $inverter,
                'message' => $inverter->is_active ? 'Inversor activado exitosamente' : 'Inversor desactivado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del inversor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for inverters.
     */
    public function statistics()
    {
        try {
            $total = Inverter::count();
            $averagePrice = Inverter::avg('price');

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'average_price' => round($averagePrice),
                ],
                'message' => 'Estadísticas de inversores obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de inversores',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}