<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // ========================================
    // LOGIN
    // ========================================

    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['login'])
            ->orWhere('phone_number', $validated['login'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email/phone number or password.',
            ], 401);
        }

        $token = $user->createToken('DentalSmart Login')->plainTextToken;

        return response()->json([
            'message' => 'Login successful!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
            ],
        ], 200);
    }


    // ========================================
    // LOGOUT
    // ========================================

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }


    // ========================================
    // CHANGE PASSWORD
    // ========================================

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',

            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        // Prevent using the same password
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'Your new password must be different from your current password.',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully!',
        ], 200);
    }
}
