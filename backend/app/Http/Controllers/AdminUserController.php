<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // ========================================
    // DISPLAY ALL REGISTERED USERS
    // ========================================
    public function index(Request $request)
    {
        $users = User::query()
            ->select(
                'id',
                'first_name',
                'last_name',
                'email',
                'phone_number',
                'role',
                'created_at'
            )
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    // ========================================
    // VIEW ONE USER
    // ========================================
    public function show($id)
    {
        $user = User::select(
            'id',
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'role',
            'created_at'
        )->findOrFail($id);

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    // ========================================
    // GET ADMIN DASHBOARD STATISTICS
    // ========================================
    public function dashboardStats(Request $request)
    {
        // Allow admin accounts only
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            403
        );

        // Count registered accounts by role
        $totalPatients = User::where('role', 'patient')->count();

        $totalStaff = User::where('role', 'staff')->count();

        $totalDentists = User::where('role', 'dentist')->count();

        // Count all registered users
        $totalUsers = User::count();

        return response()->json([
            'success' => true,
            'total_patients' => $totalPatients,
            'total_staff' => $totalStaff,
            'total_dentists' => $totalDentists,
            'total_users' => $totalUsers
        ], 200);
    }
}
