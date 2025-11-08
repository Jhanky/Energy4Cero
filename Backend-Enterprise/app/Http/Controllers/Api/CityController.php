<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CityController extends Controller
{
    /**
     * Obtener todas las ciudades
     */
    public function index()
    {
        try {
            $cities = City::with('department')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cities,
                'message' => 'Ciudades obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ciudades',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva ciudad
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:cities,name,NULL,city_id,department_id,' . $request->department_id,
                'department_id' => 'required|exists:departments,department_id',
            ], [
                'name.required' => 'El nombre de la ciudad es obligatorio.',
                'name.unique' => 'El nombre de la ciudad ya existe en este departamento.',
                'department_id.required' => 'El departamento es obligatorio.',
                'department_id.exists' => 'El departamento seleccionado no existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $city = City::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $city,
                'message' => 'Ciudad creada exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la ciudad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una ciudad existente
     */
    public function update(Request $request, $id)
    {
        try {
            $city = City::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:cities,name,' . $id . ',city_id,department_id,' . $request->department_id,
                'department_id' => 'required|exists:departments,department_id',
            ], [
                'name.required' => 'El nombre de la ciudad es obligatorio.',
                'name.unique' => 'El nombre de la ciudad ya existe en este departamento.',
                'department_id.required' => 'El departamento es obligatorio.',
                'department_id.exists' => 'El departamento seleccionado no existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $city->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $city,
                'message' => 'Ciudad actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la ciudad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una ciudad
     */
    public function destroy($id)
    {
        try {
            $city = City::findOrFail($id);
            $city->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ciudad eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la ciudad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una ciudad específica
     */
    public function show($id)
    {
        try {
            $city = City::with('department')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $city,
                'message' => 'Ciudad obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ciudad no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener ciudades por departamento
     */
    public function byDepartment($departmentId)
    {
        try {
            $cities = City::where('department_id', $departmentId)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cities,
                'message' => 'Ciudades obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ciudades',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}