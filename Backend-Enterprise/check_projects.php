<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Project;

echo "Total proyectos: " . Project::count() . "\n";

$projects = Project::all();
foreach ($projects as $project) {
    echo "ID: {$project->id}, Name: {$project->name}, Code: {$project->code}\n";
}
