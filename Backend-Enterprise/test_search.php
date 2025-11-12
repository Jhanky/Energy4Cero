<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Material;

echo "=== TESTING MATERIAL SEARCH ===\n\n";

try {
    // Test search with 'PROD'
    $searchTerm = 'PROD';
    echo "Searching for: '{$searchTerm}'\n";

    $query = Material::where(function ($q) use ($searchTerm) {
        $q->where('product_id', 'like', "%{$searchTerm}%")
          ->orWhere('description', 'like', "%{$searchTerm}%")
          ->orWhere('category', 'like', "%{$searchTerm}%");
    });

    $materials = $query->get();

    echo "Materials found: " . $materials->count() . "\n\n";

    if ($materials->count() > 0) {
        echo "First 5 results:\n";
        foreach ($materials->take(5) as $material) {
            echo "- {$material->product_id}: {$material->description} (Category: {$material->category})\n";
        }
    }

    // Test with 'cable'
    echo "\n---\n";
    $searchTerm2 = 'cable';
    echo "Searching for: '{$searchTerm2}'\n";

    $query2 = Material::where(function ($q) use ($searchTerm2) {
        $q->where('product_id', 'like', "%{$searchTerm2}%")
          ->orWhere('description', 'like', "%{$searchTerm2}%")
          ->orWhere('category', 'like', "%{$searchTerm2}%");
    });

    $materials2 = $query2->get();

    echo "Materials found: " . $materials2->count() . "\n\n";

    if ($materials2->count() > 0) {
        echo "First 5 results:\n";
        foreach ($materials2->take(5) as $material) {
            echo "- {$material->product_id}: {$material->description} (Category: {$material->category})\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
