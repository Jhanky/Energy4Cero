<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register morph mappings for polymorphic relationships
        \Illuminate\Database\Eloquent\Relations\Relation::morphMap([
            'panel' => \App\Models\Panel::class,
            'inverter' => \App\Models\Inverter::class,
            'battery' => \App\Models\Battery::class,
        ]);
    }
}
