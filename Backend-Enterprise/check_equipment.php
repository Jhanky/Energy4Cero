<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Panel;
use App\Models\Inverter;
use App\Models\Battery;

echo "Paneles: " . Panel::count() . PHP_EOL;
echo "Inversores: " . Inverter::count() . PHP_EOL;
echo "Baterías: " . Battery::count() . PHP_EOL;

echo PHP_EOL . "Primeros 5 paneles:" . PHP_EOL;
Panel::take(5)->get()->each(function($panel) {
    echo "- ID: {$panel->panel_id}, Brand: {$panel->brand}, Model: {$panel->model}, Power: {$panel->power_output}W" . PHP_EOL;
});

echo PHP_EOL . "Primeros 5 inversores:" . PHP_EOL;
Inverter::take(5)->get()->each(function($inverter) {
    echo "- ID: {$inverter->inverter_id}, Name: {$inverter->name}, Model: {$inverter->model}, Power: {$inverter->power_output_kw}kW" . PHP_EOL;
});

echo PHP_EOL . "Primeros 5 baterías:" . PHP_EOL;
Battery::take(5)->get()->each(function($battery) {
    echo "- ID: {$battery->battery_id}, Name: {$battery->name}, Model: {$battery->model}, Capacity: {$battery->ah_capacity}Ah, Voltage: {$battery->voltage}V" . PHP_EOL;
});
