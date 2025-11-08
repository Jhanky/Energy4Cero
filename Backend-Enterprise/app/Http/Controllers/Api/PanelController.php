<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PanelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Panel::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('model', 'like', "%{$search}%");
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
            $panels = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'panels' => $panels->items(),
                    'pagination' => [
                        'current_page' => $panels->currentPage(),
                        'per_page' => $panels->perPage(),
                        'total' => $panels->total(),
                        'last_page' => $panels->lastPage(),
                        'from' => $panels->firstItem(),
                        'to' => $panels->lastItem(),
                    ],
                ],
                'message' => 'Paneles obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener paneles',
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
                'model' => 'required|string|max:255|unique:panels,model',
                'brand' => 'required|string|max:255',
                'power_output' => 'required|numeric|min:0',
                'price' => 'required|numeric|min:0',
                'technical_sheet' => 'nullable|file|mimes:pdf|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $panelData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                $path = $request->file('technical_sheet')->store('technical_sheets/panels', 'public');
                $panelData['technical_sheet_path'] = $path;
            }

            $panel = Panel::create($panelData);

            return response()->json([
                'success' => true,
                'data' => $panel,
                'message' => 'Panel creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el panel',
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
            $panel = Panel::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $panel,
                'message' => 'Panel obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Panel no encontrado',
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
            $panel = Panel::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'model' => 'required|string|max:255|unique:panels,model,' . $id . ',panel_id',
                'brand' => 'required|string|max:255',
                'power_output' => 'required|numeric|min:0',
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

            $panelData = $request->except('technical_sheet');

            if ($request->hasFile('technical_sheet')) {
                // Eliminar ficha técnica antigua si existe
                if ($panel->technical_sheet_path) {
                    Storage::disk('public')->delete($panel->technical_sheet_path);
                }
                $path = $request->file('technical_sheet')->store('technical_sheets/panels', 'public');
                $panelData['technical_sheet_path'] = $path;
            } elseif ($request->input('technical_sheet_path') === null) {
                // Si se envía technical_sheet_path como null, significa que se quiere eliminar la ficha técnica existente
                if ($panel->technical_sheet_path) {
                    Storage::disk('public')->delete($panel->technical_sheet_path);
                }
                $panelData['technical_sheet_path'] = null;
            }

            $panel->update($panelData);

            return response()->json([
                'success' => true,
                'data' => $panel,
                'message' => 'Panel actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el panel',
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
            // Verificar si el panel existe
            $panel = Panel::findOrFail($id);

            // Verificar si el panel está siendo usado en algún proyecto
            // (esto es un ejemplo, deberías adaptarlo a tu lógica de negocio)
            // $isInUse = $panel->projects()->exists();
            // if ($isInUse) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'No se puede eliminar el panel porque está siendo usado en proyectos'
            //     ], 400);
            // }

            // Eliminar ficha técnica si existe
            if ($panel->technical_sheet_path) {
                Storage::disk('public')->delete($panel->technical_sheet_path);
            }

            // Eliminar el panel
            $panel->delete();

            return response()->json([
                'success' => true,
                'message' => 'Panel eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al eliminar panel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el panel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado activo/inactivo de un panel
     */
    public function toggleStatus(string $id)
    {
        try {
            $panel = Panel::findOrFail($id);
            $panel->is_active = !$panel->is_active;
            $panel->save();

            return response()->json([
                'success' => true,
                'data' => $panel,
                'message' => $panel->is_active ? 'Panel activado exitosamente' : 'Panel desactivado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del panel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for panels.
     */
    public function statistics()
    {
        try {
            $total = Panel::count();
            $averagePrice = Panel::avg('price');

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'average_price' => round($averagePrice),
                ],
                'message' => 'Estadísticas de paneles obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de paneles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
