<?php

namespace App\Exports;

use App\Models\Material;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class MaterialsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query para obtener los materiales
     */
    public function query()
    {
        $query = Material::with(['warehouse']);

        // Aplicar filtros si existen
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('product_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if (!empty($this->filters['warehouse_id'])) {
            $query->where('warehouse_id', $this->filters['warehouse_id']);
        }

        if (!empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', $this->filters['is_active'] === 'true');
        }

        return $query->orderBy('product_id');
    }

    /**
     * Encabezados de las columnas
     */
    public function headings(): array
    {
        return [
            'ID_Producto',
            'Descripción',
            'Cantidad',
            'Unidad/Medida',
            'Categoría',
            'Ubicación',
            'Notas',
            'Estado',
            'Fecha Creación',
            'Última Actualización'
        ];
    }

    /**
     * Mapear los datos de cada fila
     */
    public function map($material): array
    {
        return [
            $material->product_id,
            $material->description,
            $material->quantity,
            $material->unit_measure,
            $material->category,
            $material->warehouse ? $material->warehouse->name : 'Sin asignar',
            $material->notes,
            $material->is_active ? 'Activo' : 'Inactivo',
            $material->created_at ? $material->created_at->format('Y-m-d H:i:s') : '',
            $material->updated_at ? $material->updated_at->format('Y-m-d H:i:s') : '',
        ];
    }

    /**
     * Estilos para el archivo Excel
     */
    public function styles(Worksheet $sheet)
    {
        // Estilo para la fila de encabezados
        $sheet->getStyle('A1:J1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F81BD'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Bordes para todas las celdas con datos
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        $sheet->getStyle('A2:' . $lastColumn . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ]);

        // Alinear cantidad a la derecha
        $sheet->getStyle('C2:C' . $lastRow)->getAlignment()->setHorizontal('right');

        return [
            // Estilos adicionales si son necesarios
            1 => ['font' => ['bold' => true]],
        ];
    }
}
