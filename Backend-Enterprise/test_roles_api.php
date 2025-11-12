<?php

// Simple test script to check if the roles API returns users_count
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;

echo "Testing roles API response...\n\n";

try {
    // Test the query that the controller uses
    $roles = Role::withCount('users')->paginate(15);

    echo "Roles found: " . $roles->count() . "\n\n";

    foreach ($roles->items() as $role) {
        echo "Role: {$role->name}\n";
        echo "Users count: {$role->users_count}\n";
        echo "Has users_count attribute: " . (property_exists($role, 'users_count') ? 'YES' : 'NO') . "\n";
        echo "---\n";
    }

    echo "\nTest completed successfully!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
