<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id');

            $table->foreignId('patient_id')
                ->constrained('patients', 'patient_id')
                ->onDelete('cascade');

            $table->foreignId('schedule_id')
                ->constrained('schedules', 'schedule_id')
                ->onDelete('cascade');

            $table->date('appointment_date');
            $table->time('appointment_time');

            $table->enum('status', [
                'pending',
                'approved',
                'cancelled',
                'completed'
            ])->default('pending');

            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};