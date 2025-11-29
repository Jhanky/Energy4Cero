// Verificar cotizaciones
\App\Models\Quotation::count();

// Listar cotizaciones con usuarios
\App\Models\Quotation::with('user')->get()->map(function($q) {
    return [
        'id' => $q->quotation_id,
        'project' => $q->project_name,
        'user_id' => $q->user_id,
        'user_name' => $q->user ? $q->user->name : 'N/A',
        'user_email' => $q->user ? $q->user->email : 'N/A'
    ];
});

// Verificar usuario admin
$admin = \App\Models\User::where('email', 'admin@energy4cero.com')->with('role')->first();
if ($admin) {
    echo "Admin ID: {$admin->id}, Rol: " . ($admin->role ? $admin->role->slug : 'sin rol') . "\n";
    echo "Cotizaciones del admin: " . \App\Models\Quotation::where('user_id', $admin->id)->count() . "\n";
}

// Listar todos los usuarios con sus cotizaciones
\App\Models\User::with('role')->get()->map(function($u) {
    return [
        'id' => $u->id,
        'name' => $u->name,
        'email' => $u->email,
        'role' => $u->role ? $u->role->slug : 'sin rol',
        'quotations_count' => \App\Models\Quotation::where('user_id', $u->id)->count()
    ];
});
