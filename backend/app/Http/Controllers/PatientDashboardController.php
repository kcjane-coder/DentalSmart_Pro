<?php

namespace App\Http\Controllers;

use App\Models\Post;

class PatientDashboardController extends Controller
{
    public function index()
    {
        abort_unless(
            auth()->check() && auth()->user()->role === 'patient',
            403
        );

        $posts = Post::with('dentist')
            ->whereHas('dentist')
            ->latest()
            ->get();

        return view('patient.dashboard', compact('posts'));
    }
}
