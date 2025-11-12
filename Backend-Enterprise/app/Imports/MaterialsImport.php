<?php

namespace App\Imports;

use App\Models\Material;
use App\Models\Warehouse;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class MaterialsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    private $results = [
        'imported' => 0,
        'updated' => 0,
        'errors' => [],
        'skipped' => []
    ];

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Verificar si el material ya existe
        $existingMaterial = Material::where('product_id', $row['id_producto'])->first();

        // Buscar bodega por nombre si se proporciona
        $warehouseId = null;
        if (!empty($row['ubicacion'])) {
            $warehouse = Warehouse::where('name', 'like', '%' . trim($row['ubicacion']) . '%')->first();
            $warehouseId = $warehouse ? $warehouse->id : null;
        }

        $data = [
            'product_id' => trim($row['id_producto']),
            'description' => trim($row['descripcion']),
            'quantity' => floatval($row['cantidad'] ?? 0),
            'unit_measure' => trim($row['unidad_medida'] ?? 'unidades'),
            'category' => trim($row['categoria'] ?? 'Sin categoría'),
            'warehouse_id' => $warehouseId,
            'notes' => trim($row['notas'] ?? ''),
            'is_active' => true,
        ];

        if ($existingMaterial) {
            // Actualizar material existente
            $existingMaterial->update($data);
            $this->results['updated']++;
            return null; // No crear nuevo modelo
        } else {
            // Crear nuevo material
            $this->results['imported']++;
            return new Material($data);
        }
    }

    /**
     * Reglas de validación
     */
    public function rules(): array
    {
        return [
            'id_producto' => 'required|string|max:255',
            'descripcion' => 'required|string|max:1000',
            'cantidad' => 'nullable|numeric|min:0',
            'unidad_medida' => 'nullable|string|max:255',
            'categoria' => 'nullable|string|max:255',
            'ubicacion' => 'nullable|string|max:255',
            'notas' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Mensajes de validación personalizados
     */
    public function customValidationMessages()
    {
        return [
            'id_producto.required' => 'El ID del producto es obligatorio',
            'descripcion.required' => 'La descripción es obligatoria',
            'cantidad.numeric' => 'La cantidad debe ser un número',
            'cantidad.min' => 'La cantidad debe ser mayor o igual a 0',
        ];
    }

    /**
     * Manejar errores de validación
     */
    public function onError(Throwable $e)
    {
        $this->results['errors'][] = [
            'row' => 'Desconocida',
            'error' => $e->getMessage()
        ];
    }

    /**
     * Manejar fallos de validación
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->results['errors'][] = [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
                'values' => $failure->values()
            ];
        }
    }

    /**
     * Obtener resultados de la importación
     */
    public function getResults()
    {
        return $this->results;
    }
}
