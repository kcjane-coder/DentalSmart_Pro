<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Dentist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminDentistController extends Controller
{
    // VIEW ALL DENTISTS
    public function index()
    {
        return response()->json(
            Dentist::with('user')->get()
        );
    }

    // VIEW ONE DENTIST
    public function show($id)
    {
        $dentist = Dentist::with('user')->findOrFail($id);

        return response()->json($dentist);
    }

    // CREATE DENTIST ACCOUNT
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'specialization' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        $dentist = DB::transaction(function () use ($validated) {

            // CREATE USER ACCOUNT
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => 'dentist',
            ]);

            // CREATE DENTIST PROFILE
            $dentist = Dentist::create([
                'user_id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'contact' => $user->phone_number,
                'specialization' => $validated['specialization'] ?? null,
                'bio' => $validated['bio'] ?? null,
            ]);

            return $dentist;
        });

        return response()->json([
            'message' => 'Dentist account created successfully!',
            'dentist' => $dentist->load('user'),
        ], 201);
    }
}
