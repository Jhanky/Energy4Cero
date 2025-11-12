<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MaterialCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear algunos materiales de ejemplo con diferentes categorías
        // Este seeder crea materiales de ejemplo para demostrar las categorías
        $materials = [
            // Cables y Conductores
            [
                'product_id' => 'CAB-001',
                'description' => 'Cable de cobre AWG 10 para conexiones solares',
                'quantity' => 500,
                'unit_measure' => 'metros',
                'category' => 'Cables y Conductores',
                'warehouse_id' => 1, // Asumiendo que existe la bodega principal
                'notes' => 'Cable de cobre flexible para instalaciones fotovoltaicas',
                'is_active' => true,
            ],
            [
                'product_id' => 'CAB-002',
                'description' => 'Cable de aluminio AWG 6 para líneas principales',
                'quantity' => 200,
                'unit_measure' => 'metros',
                'category' => 'Cables y Conductores',
                'warehouse_id' => 1,
                'notes' => 'Cable de aluminio para líneas de distribución',
                'is_active' => true,
            ],

            // Conectores y Terminales
            [
                'product_id' => 'CON-001',
                'description' => 'Conector MC4 para paneles solares',
                'quantity' => 100,
                'unit_measure' => 'unidades',
                'category' => 'Conectores y Terminales',
                'warehouse_id' => 1,
                'notes' => 'Conectores estándar para módulos fotovoltaicos',
                'is_active' => true,
            ],
            [
                'product_id' => 'CON-002',
                'description' => 'Terminales de cobre para bornes',
                'quantity' => 50,
                'unit_measure' => 'paquetes',
                'category' => 'Conectores y Terminales',
                'warehouse_id' => 1,
                'notes' => 'Terminales aislados para conexiones eléctricas',
                'is_active' => true,
            ],

            // Estructuras de Montaje
            [
                'product_id' => 'EST-001',
                'description' => 'Perfil de aluminio para estructuras solares',
                'quantity' => 30,
                'unit_measure' => 'metros',
                'category' => 'Estructuras de Montaje',
                'warehouse_id' => 1,
                'notes' => 'Perfiles de aluminio anodizado para soportes',
                'is_active' => true,
            ],
            [
                'product_id' => 'EST-002',
                'description' => 'Tornillos M8 para fijación de estructuras',
                'quantity' => 200,
                'unit_measure' => 'unidades',
                'category' => 'Estructuras de Montaje',
                'warehouse_id' => 1,
                'notes' => 'Tornillos galvanizados con arandela',
                'is_active' => true,
            ],

            // Protección y Seguridad
            [
                'product_id' => 'SEG-001',
                'description' => 'Interruptor diferencial 40A',
                'quantity' => 10,
                'unit_measure' => 'unidades',
                'category' => 'Protección y Seguridad',
                'warehouse_id' => 1,
                'notes' => 'Interruptor diferencial tipo AC para protección',
                'is_active' => true,
            ],
            [
                'product_id' => 'SEG-002',
                'description' => 'Fusibles de 15A para protección',
                'quantity' => 25,
                'unit_measure' => 'unidades',
                'category' => 'Protección y Seguridad',
                'warehouse_id' => 1,
                'notes' => 'Fusibles cerámicos de alta calidad',
                'is_active' => true,
            ],

            // Herramientas Eléctricas
            [
                'product_id' => 'HER-001',
                'description' => 'Pelacables automático 0.5-6mm²',
                'quantity' => 5,
                'unit_measure' => 'unidades',
                'category' => 'Herramientas Eléctricas',
                'warehouse_id' => 1,
                'notes' => 'Pelacables profesional para cables solares',
                'is_active' => true,
            ],
            [
                'product_id' => 'HER-002',
                'description' => 'Multímetro digital profesional',
                'quantity' => 3,
                'unit_measure' => 'unidades',
                'category' => 'Herramientas Eléctricas',
                'warehouse_id' => 1,
                'notes' => 'Multímetro con medición de corriente continua',
                'is_active' => true,
            ],

            // Materiales de Instalación
            [
                'product_id' => 'INS-001',
                'description' => 'Cinta aislante PVC 19mm x 20m',
                'quantity' => 15,
                'unit_measure' => 'rollos',
                'category' => 'Materiales de Instalación',
                'warehouse_id' => 1,
                'notes' => 'Cinta aislante de PVC de alta calidad',
                'is_active' => true,
            ],
            [
                'product_id' => 'INS-002',
                'description' => 'Abrazaderas para cables 10-12mm',
                'quantity' => 100,
                'unit_measure' => 'unidades',
                'category' => 'Materiales de Instalación',
                'warehouse_id' => 1,
                'notes' => 'Abrazaderas plásticas para sujeción de cables',
                'is_active' => true,
            ],
        ];

        foreach ($materials as $material) {
            // Verificar si ya existe el material
            $existingMaterial = \App\Models\Material::where('product_id', $material['product_id'])->first();

            if (!$existingMaterial) {
                \App\Models\Material::create($material);
            }
        }
    }
}
