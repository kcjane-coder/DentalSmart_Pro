<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    private const DURATION = 15;

    /*
    |--------------------------------------------------------------------------
    | APPOINTMENT QUERY
    |--------------------------------------------------------------------------
    | Retrieves appointment information together with dentist information.
    */

    private function appointmentQuery()
    {
        return DB::table('appointments')
            ->join(
                'schedules',
                'appointments.schedule_id',
                '=',
                'schedules.schedule_id'
            )
            ->leftJoin(
                'dentists',
                'schedules.dentist_id',
                '=',
                'dentists.dentist_id'
            )
            ->leftJoin(
                'users',
                'dentists.user_id',
                '=',
                'users.id'
            )
            ->select(
                'appointments.*',
                'schedules.dentist_id',
                'users.first_name as dentist_first_name',
                'users.last_name as dentist_last_name'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | GET APPOINTMENTS
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $query = $this->appointmentQuery();

        if (auth()->user()->role === 'patient') {

            $patientId = $this->getPatientId();

            if (!$patientId) {
                return response()->json([
                    'message' => 'Patient not found.'
                ], 404);
            }

            $query->where(
                'appointments.patient_id',
                $patientId
            );
        }

        $appointments = $query
            ->orderByDesc('appointments.appointment_date')
            ->orderByDesc('appointments.appointment_time')
            ->get();

        return response()->json([
            'message' => 'Appointments retrieved successfully.',
            'appointments' => $appointments
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE APPOINTMENT
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => ['required', 'integer'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'patient_id' => [
                'required_if:user.role,staff',
                'nullable',
                'integer'
            ],
        ]);

        $role = auth()->user()->role;

        $patientId = $role === 'patient'
            ? $this->getPatientId()
            : ($validated['patient_id'] ?? null);

        if (!$patientId) {
            return response()->json([
                'message' => 'Patient not found.'
            ], 404);
        }

        try {

            $appointment = DB::transaction(function () use (
                $validated,
                $patientId
            ) {

                $schedule = DB::table('schedules')
                    ->where(
                        'schedule_id',
                        $validated['schedule_id']
                    )
                    ->lockForUpdate()
                    ->first();

                if (
                    !$schedule ||
                    !$schedule->is_available ||
                    $schedule->available_date !==
                        $validated['appointment_date']
                ) {
                    abort(
                        422,
                        'The selected schedule is unavailable.'
                    );
                }

                $start = Carbon::parse(
                    $schedule->available_date . ' ' .
                    $schedule->start_time
                );

                $end = Carbon::parse(
                    $schedule->available_date . ' ' .
                    $schedule->end_time
                );

                $requested = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $validated['appointment_date'] . ' ' .
                    $validated['appointment_time']
                );

                if (
                    $requested->lt($start) ||
                    $requested->copy()
                        ->addMinutes(self::DURATION)
                        ->gt($end) ||
                    ($start->diffInMinutes($requested)
                        % self::DURATION !== 0)
                ) {
                    abort(
                        422,
                        'Invalid appointment time. Appointments must be 15-minute slots.'
                    );
                }

                $exists = DB::table('appointments')
                    ->where(
                        'schedule_id',
                        $schedule->schedule_id
                    )
                    ->where(
                        'appointment_date',
                        $validated['appointment_date']
                    )
                    ->where(
                        'appointment_time',
                        $requested->format('H:i:s')
                    )
                    ->where('status', '!=', 'cancelled')
                    ->exists();

                if ($exists) {
                    abort(
                        409,
                        'This appointment slot is already booked.'
                    );
                }

                $id = DB::table('appointments')->insertGetId([
                    'patient_id' => $patientId,
                    'schedule_id' => $schedule->schedule_id,
                    'appointment_date' =>
                        $validated['appointment_date'],
                    'appointment_time' =>
                        $requested->format('H:i:s'),
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ], 'appointment_id');

                return $id;
            });

            $appointmentDetails = $this->appointmentQuery()
                ->where(
                    'appointments.appointment_id',
                    $appointment
                )
                ->first();

            return response()->json([
                'message' => 'Appointment successfully booked.',
                'appointment' => $appointmentDetails
            ], 201);

        } catch (\Throwable $e) {

            report($e);

            $statusCode = $e->getCode();

            if ($statusCode < 400 || $statusCode > 599) {
                $statusCode = 500;
            }

            return response()->json([
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW SINGLE APPOINTMENT
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $appointment = $this->appointmentQuery()
            ->where(
                'appointments.appointment_id',
                $id
            )
            ->first();

        if (!$appointment) {
            return response()->json([
                'message' => 'Appointment not found.'
            ], 404);
        }

        if (auth()->user()->role === 'patient') {

            $patientId = $this->getPatientId();

            if ($appointment->patient_id != $patientId) {
                return response()->json([
                    'message' => 'Unauthorized.'
                ], 403);
            }
        }

        return response()->json([
            'appointment' => $appointment
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE APPOINTMENT STATUS
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,approved,cancelled,completed'
            ]
        ]);

        $appointment = DB::table('appointments')
            ->where('appointment_id', $id)
            ->first();

        if (!$appointment) {
            return response()->json([
                'message' => 'Appointment not found.'
            ], 404);
        }

        DB::table('appointments')
            ->where('appointment_id', $id)
            ->update([
                'status' => $validated['status'],
                'cancelled_at' =>
                    $validated['status'] === 'cancelled'
                        ? now()
                        : null,
                'updated_at' => now()
            ]);

        return response()->json([
            'message' => 'Appointment status updated successfully.'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CANCEL APPOINTMENT
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $appointment = DB::table('appointments')
            ->where('appointment_id', $id)
            ->first();

        if (!$appointment) {
            return response()->json([
                'message' => 'Appointment not found.'
            ], 404);
        }

        DB::table('appointments')
            ->where('appointment_id', $id)
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'updated_at' => now()
            ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully.'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | GET LOGGED-IN PATIENT ID
    |--------------------------------------------------------------------------
    */

    private function getPatientId()
    {
        return DB::table('patients')
            ->where('user_id', auth()->id())
            ->value('patient_id');
    }
}
