<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AIAssistantController extends Controller
{
    private const DURATION = 15;

    public function chat(Request $request)
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $message = strtolower(trim($request->message));

        $patientId = $this->getPatientId();

        if (!$patientId) {
            return response()->json([
                'message' => 'Patient account not found.'
            ], 404);
        }

        // Extract appointment date
        $date = $this->extractDate($message);

        if (!$date) {
            return response()->json([
                'reply' => 'Sure! I can help you book an appointment. What date would you prefer? You can say today, tomorrow, or provide a date like 2026-11-06.'
            ]);
        }

        if (Carbon::parse($date)->isPast()) {
            return response()->json([
                'reply' => 'Sorry, that date has already passed. Please choose a future date.'
            ]);
        }

        // Extract preferred time
        $time = $this->extractTime($message);

        // Get available dentist schedules
        $schedules = DB::table('schedules')
            ->where('available_date', $date)
            ->where('is_available', 1)
            ->orderBy('start_time')
            ->get();

        if ($schedules->isEmpty()) {
            return response()->json([
                'reply' => 'Sorry, there are no available dentist schedules on ' .
                    Carbon::parse($date)->format('F d, Y') .
                    '. Please choose another date.'
            ]);
        }

        // Check if patient wants to book
        if (str_contains($message, 'book') ||
            str_contains($message, 'reserve') ||
            str_contains($message, 'confirm')) {

            if (!$time) {
                return response()->json([
                    'reply' => 'What time would you like to book? Each appointment lasts 15 minutes.'
                ]);
            }

            return $this->bookAppointment(
                $patientId,
                $date,
                $time
            );
        }

        // Generate available 15-minute slots
        $availableSlots = [];

        foreach ($schedules as $schedule) {

            $start = Carbon::parse($schedule->available_date . ' ' . $schedule->start_time);
            $end = Carbon::parse($schedule->available_date . ' ' . $schedule->end_time);

            $current = $start->copy();

            while ($current->copy()->addMinutes(self::DURATION)->lte($end)) {

                $slotTime = $current->format('H:i:s');

                $booked = DB::table('appointments')
                    ->where('schedule_id', $schedule->schedule_id)
                    ->where('appointment_date', $date)
                    ->where('appointment_time', $slotTime)
                    ->where('status', '!=', 'cancelled')
                    ->exists();

                if (!$booked) {
                    $availableSlots[] = [
                        'schedule_id' => $schedule->schedule_id,
                        'dentist_id' => $schedule->dentist_id,
                        'date' => $date,
                        'time' => $current->format('h:i A'),
                    ];
                }

                $current->addMinutes(self::DURATION);
            }
        }

        if (empty($availableSlots)) {
            return response()->json([
                'reply' => 'Sorry, all appointment slots for this date are already booked. Please choose another date.'
            ]);
        }

        // Check preferred time
        if ($time) {

            $matchingSlot = collect($availableSlots)->first(
                fn ($slot) => $slot['time'] === $time
            );

            if ($matchingSlot) {
                return response()->json([
                    'reply' => 'Good news! ' . $time . ' is available on ' .
                        Carbon::parse($date)->format('F d, Y') .
                        '. Each appointment lasts 15 minutes. To reserve this slot, say: Book ' .
                        $date . ' at ' . $time . '.',
                    'available' => true,
                    'slot' => $matchingSlot
                ]);
            }

            $suggestions = collect($availableSlots)->take(5);

            $reply = 'Sorry, ' . $time . ' is not available. Here are some alternative times:';

            foreach ($suggestions as $slot) {
                $reply .= "\n- " . $slot['time'];
            }

            $reply .= "\n\nTo book, say: Book " . $date . ' at your preferred time.';

            return response()->json([
                'reply' => $reply,
                'available' => false,
                'suggestions' => $suggestions->values()
            ]);
        }

        // Show available slots
        $suggestions = collect($availableSlots)->take(8);

        $reply = 'Here are the available appointment times for ' .
            Carbon::parse($date)->format('F d, Y') . ":\n";

        foreach ($suggestions as $slot) {
            $reply .= "\n- " . $slot['time'];
        }

        $reply .= "\n\nWhich time would you prefer?";

        return response()->json([
            'reply' => $reply,
            'available_slots' => $suggestions->values()
        ]);
    }

    private function bookAppointment($patientId, $date, $time)
    {
        try {

            $appointment = DB::transaction(function () use (
                $patientId,
                $date,
                $time
            ) {

                $schedules = DB::table('schedules')
                    ->where('available_date', $date)
                    ->where('is_available', 1)
                    ->orderBy('schedule_id')
                    ->lockForUpdate()
                    ->get();

                foreach ($schedules as $schedule) {

                    $start = Carbon::parse(
                        $date . ' ' . $schedule->start_time
                    );

                    $end = Carbon::parse(
                        $date . ' ' . $schedule->end_time
                    );

                    $requested = Carbon::parse(
                        $date . ' ' . $time
                    );

                    $requestedEnd = $requested->copy()
                        ->addMinutes(self::DURATION);

                    if (
                        $requested->lt($start) ||
                        $requestedEnd->gt($end)
                    ) {
                        continue;
                    }

                    // Must align with 15-minute slots
                    $minutes = $start->diffInMinutes($requested);

                    if ($minutes % self::DURATION !== 0) {
                        continue;
                    }

                    $booked = DB::table('appointments')
                        ->where('schedule_id', $schedule->schedule_id)
                        ->where('appointment_date', $date)
                        ->where('appointment_time', $requested->format('H:i:s'))
                        ->where('status', '!=', 'cancelled')
                        ->exists();

                    if ($booked) {
                        continue;
                    }

                    $id = DB::table('appointments')->insertGetId([
                        'patient_id' => $patientId,
                        'schedule_id' => $schedule->schedule_id,
                        'appointment_date' => $date,
                        'appointment_time' => $requested->format('H:i:s'),
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ], 'appointment_id');

                    return DB::table('appointments')
                        ->where('appointment_id', $id)
                        ->first();
                }

                return null;
            });

            if (!$appointment) {
                return response()->json([
                    'reply' => 'Sorry, that time is no longer available. Please choose another available slot.'
                ], 409);
            }

            return response()->json([
                'success' => true,
                'reply' => 'Your dental appointment has been successfully submitted! Your appointment status is PENDING. Please wait for clinic confirmation.',
                'appointment' => $appointment
            ]);

        } catch (\Throwable $e) {

            report($e);

            return response()->json([
                'reply' => 'Something went wrong while booking your appointment. Please try again.'
            ], 500);
        }
    }

    private function getPatientId()
    {
        return DB::table('patients')
            ->where('user_id', auth()->id())
            ->value('patient_id');
    }

    private function extractDate($message)
    {
        if (preg_match('/\b(\d{4}-\d{2}-\d{2})\b/', $message, $matches)) {
            try {
                return Carbon::createFromFormat('Y-m-d', $matches[1])
                    ->format('Y-m-d');
            } catch (\Throwable $e) {
                return null;
            }
        }

        if (preg_match('/\btomorrow\b/', $message)) {
            return Carbon::tomorrow()->format('Y-m-d');
        }

        if (preg_match('/\btoday\b/', $message)) {
            return Carbon::today()->format('Y-m-d');
        }

        return null;
    }

    private function extractTime($message)
    {
        if (preg_match(
            '/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i',
            $message,
            $matches
        )) {
            try {
                $hour = (int) $matches[1];
                $minute = isset($matches[2]) ? (int) $matches[2] : 0;

                if ($hour < 1 || $hour > 12 || $minute > 59) {
                    return null;
                }

                return Carbon::createFromFormat(
                    'g:i A',
                    $hour . ':' . sprintf('%02d', $minute) . ' ' .
                    strtoupper($matches[3])
                )->format('h:i A');

            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }
}
