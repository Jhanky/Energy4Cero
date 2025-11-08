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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id('supplier_id');
            $table->string('name');
            $table->string('supplier_type')->default('empresa'); // empresa, persona
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('nit', 50)->nullable()->unique();
            $table->unsignedBigInteger('responsible_user_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('responsible_user_id')->references('id')->on('users');
            $table->foreign('department_id')->references('department_id')->on('departments');
            $table->foreign('city_id')->references('city_id')->on('cities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
