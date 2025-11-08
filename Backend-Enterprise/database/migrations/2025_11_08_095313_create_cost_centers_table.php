<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id('cost_center_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['Proyecto', 'Administrativo', 'Comercial', 'Técnico']);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('responsible_user_id');
            $table->decimal('budget', 15, 2)->nullable();
            $table->enum('status', ['activo', 'cerrado', 'pausado'])->default('activo');
            $table->timestamps();

            $table->foreign('responsible_user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_centers');
    }
};
