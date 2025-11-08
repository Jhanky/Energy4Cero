<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            TicketTypesSeeder::class,
            TicketPrioritiesSeeder::class,
            TicketStatesSeeder::class,
            TicketsSeeder::class,
        ]);
    }
}