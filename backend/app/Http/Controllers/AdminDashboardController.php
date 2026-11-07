<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $patients = User::where('role', 'patient')->count();
        $dentists = User::where('role', 'dentist')->count();
        $staff = User::where('role', 'staff')->count();
        $admins = User::where('role', 'admin')->count();
        $appointments = Appointment::count();

        return view('admin.dashboard', compact(
            'patients',
            'dentists',
            'staff',
            'admins',
            'appointments'
        ));
    }
}