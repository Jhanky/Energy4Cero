<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    $routes = collect(Route::getRoutes())->filter(function ($route) {
        return str_starts_with($route->uri(), 'api/');
    })->map(function ($route) {
        return [
            'uri' => $route->uri(),
            'methods' => $route->methods(),
            'name' => $route->getName(),
            'action' => $route->getActionName(),
            'middleware' => $route->middleware(),
        ];
    })->groupBy(function ($route) {
        $parts = explode('/', $route['uri']);
        return $parts[1] ?? 'other';
    });

    return view('api-routes', compact('routes'));
});

Route::get('/login', function () {
    return view('welcome');
})->name('login');
