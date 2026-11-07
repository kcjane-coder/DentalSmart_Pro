<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    private function getDentistId()
    {
        return DB::table('dentists')
            ->where('user_id', auth()->id())
            ->value('dentist_id');
    }

    public function index()
    {
        $dentistId = $this->getDentistId();

        if (!$dentistId) {
            return response()->json([
                'message' => 'Dentist account not found.'
            ], 404);
        }

        $schedules = DB::table('schedules')
            ->where('dentist_id', $dentistId)
            ->orderBy('available_date')
            ->get();

        return response()->json([
            'schedules' => $schedules
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'available_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'is_available' => ['sometimes', 'boolean']
        ]);

        $start = Carbon::createFromFormat(
            'H:i',
            $validated['start_time']
        );

        $end = Carbon::createFromFormat(
            'H:i',
            $validated['end_time']
        );

        if ($end->lte($start)) {
            return response()->json([
                'message' => 'End time must be later than start time.'
            ], 422);
        }

        $dentistId = $this->getDentistId();

        if (!$dentistId) {
            return response()->json([
                'message' => 'Dentist account not found.'
            ], 404);
        }

        $id = DB::table('schedules')->insertGetId([
            'dentist_id' => $dentistId,
            'available_date' => $validated['available_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_available' => $validated['is_available'] ?? true,
            'created_at' => now(),
            'updated_at' => now()
        ], 'schedule_id');

        return response()->json([
            'message' => 'Dentist schedule created successfully.',
            'schedule' => DB::table('schedules')
                ->where('schedule_id', $id)
                ->first()
        ], 201);
    }

    public function show($id)
    {
        $dentistId = $this->getDentistId();

        $schedule = DB::table('schedules')
            ->where('schedule_id', $id)
            ->where('dentist_id', $dentistId)
            ->first();

        if (!$schedule) {
            return response()->json([
                'message' => 'Schedule not found.'
            ], 404);
        }

        return response()->json([
            'schedule' => $schedule
        ]);
    }

    public function update(Request $request, $id)
    {
        $dentistId = $this->getDentistId();

        $schedule = DB::table('schedules')
            ->where('schedule_id', $id)
            ->where('dentist_id', $dentistId)
            ->first();

        if (!$schedule) {
            return response()->json([
                'message' => 'Schedule not found.'
            ], 404);
        }

        $validated = $request->validate([
            'available_date' => ['sometimes', 'date', 'after_or_equal:today'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'is_available' => ['sometimes', 'boolean']
        ]);

        $date = $validated['available_date'] ?? $schedule->available_date;
        $startTime = $validated['start_time'] ?? $schedule->start_time;
        $endTime = $validated['end_time'] ?? $schedule->end_time;

        $start = Carbon::parse($date . ' ' . $startTime);
        $end = Carbon::parse($date . ' ' . $endTime);

        if ($end->lte($start)) {
            return response()->json([
                'message' => 'End time must be later than start time.'
            ], 422);
        }

        // Do not change a schedule date or time
        // if it already has active appointments.

        $hasAppointments = DB::table('appointments')
            ->where('schedule_id', $id)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if (
            $hasAppointments &&
            (
                $date !== $schedule->available_date ||
                $startTime !== $schedule->start_time ||
                $endTime !== $schedule->end_time
            )
        ) {
            return response()->json([
                'message' => 'Cannot change schedule date or time because appointments already exist.'
            ], 422);
        }

        DB::table('schedules')
            ->where('schedule_id', $id)
            ->update([
                ...$validated,
                'updated_at' => now()
            ]);

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'schedule' => DB::table('schedules')
                ->where('schedule_id', $id)
                ->first()
        ]);
    }

    public function destroy($id)
    {
        $dentistId = $this->getDentistId();

        $schedule = DB::table('schedules')
            ->where('schedule_id', $id)
            ->where('dentist_id', $dentistId)
            ->first();

        if (!$schedule) {
            return response()->json([
                'message' => 'Schedule not found.'
            ], 404);
        }

        // Disable instead of deleting the schedule.
        DB::table('schedules')
            ->where('schedule_id', $id)
            ->update([
                'is_available' => 0,
                'updated_at' => now()
            ]);

        return response()->json([
            'message' => 'Schedule successfully disabled.'
        ]);
    }
}
