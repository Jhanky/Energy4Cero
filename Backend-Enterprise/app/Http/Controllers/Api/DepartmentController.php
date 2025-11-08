<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Obtener todos los departamentos
     */
    public function index()
    {
        try {
            $departments = Department::orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $departments,
                'message' => 'Departamentos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener departamentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo departamento
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments,name',
            ], [
                'name.required' => 'El nombre del departamento es obligatorio.',
                'name.unique' => 'El nombre del departamento ya existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = Department::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Departamento creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un departamento existente
     */
    public function update(Request $request, $id)
    {
        try {
            $department = Department::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments,name,' . $id . ',department_id',
            ], [
                'name.required' => 'El nombre del departamento es obligatorio.',
                'name.unique' => 'El nombre del departamento ya existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Departamento actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un departamento
     */
    public function destroy($id)
    {
        try {
            $department = Department::findOrFail($id);
            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Departamento eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un departamento específico
     */
    public function show($id)
    {
        try {
            $department = Department::with('cities')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Departamento obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Departamento no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener departamentos por región
     */
    public function byRegion($region)
    {
        try {
            $departments = Department::where('region', $region)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $departments,
                'message' => 'Departamentos obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener departamentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}