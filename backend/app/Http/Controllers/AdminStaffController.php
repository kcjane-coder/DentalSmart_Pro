<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class AdminStaffController extends Controller
{
    // FETCH STAFF
    public function index()
    {
        $staff = Staff::with('user')->get();

        return response()->json($staff);
    }

    // CREATE STAFF ACCOUNT
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'position' => ['required', 'string', 'max:255'],
        ]);

        $staff = DB::transaction(function () use ($validated) {

            // CREATE USER
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => 'staff',
            ]);

            // CREATE STAFF PROFILE
            return Staff::create([
                'user_id' => $user->id,
                'position' => $validated['position'],
            ]);
        });

        return response()->json([
            'message' => 'Staff account created successfully!',
            'staff' => $staff->load('user'),
        ], 201);
    }
}
