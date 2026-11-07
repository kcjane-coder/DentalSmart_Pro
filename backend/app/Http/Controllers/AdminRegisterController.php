<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminRegisterController extends Controller
{
    public function create()
    {
        // Check if an admin already exists
        if (User::where('role', 'admin')->exists()) {
            return view('admin.register', [
                'adminExists' => true
            ]);
        }

        return view('admin.register', [
            'adminExists' => false
        ]);
    }

    public function store(Request $request)
    {
        // Prevent creating another admin
        if (User::where('role', 'admin')->exists()) {
            return redirect()
                ->route('admin.register')
                ->with('error', 'An Admin account already exists. Only one Admin account is allowed.');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                Rules\Password::defaults(),
            ],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        return redirect()
            ->route('login')
            ->with('success', 'Admin account created successfully. You can now log in.');
    }
}