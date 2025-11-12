<?php

require_once 'vendor/autoload.php';

echo "Testing Excel import class...\n";

try {
    $import = new App\Imports\MaterialsImport();
    echo "✅ MaterialsImport class loaded successfully\n";

    // Test if Excel facade is available
    if (class_exists('Maatwebsite\Excel\Facades\Excel')) {
        echo "✅ Excel facade is available\n";
    } else {
        echo "❌ Excel facade not found\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
