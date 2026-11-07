
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// ========================================
// CONTROLLERS
// ========================================

// Patient / Dentist / Appointment / Schedule
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DentistController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostInteractionController;

// Authentication
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\AuthController;

// AI Appointment Assistant
use App\Http\Controllers\Api\AIAssistantController;

// Admin
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminDentistController;
use App\Http\Controllers\AdminStaffController;


// ========================================
// PUBLIC ROUTES
// ========================================

Route::post('/register', [
    RegisterController::class,
    'register'
]);

Route::post('/login', [
    LoginController::class,
    'login'
]);


// ========================================
// AUTHENTICATED ROUTES
// ========================================

Route::middleware('auth:sanctum')->group(function () {

    // ========================================
    // AUTHENTICATED USER
    // ========================================

    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user()
        ]);
    });


    // ========================================
    // PROFILE
    // ========================================

    // GET PROFILE
    Route::get('/profile', function (Request $request) {
        return response()->json([
            'user' => $request->user()
        ]);
    });


    // UPDATE PROFILE INFORMATION
    Route::put('/profile', function (Request $request) {

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|string|max:30',
            'date_of_birth' => 'nullable|date',
        ]);

        $user = $request->user();

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];
        $user->phone_number = $validated['phone_number'] ?? null;
        $user->gender = $validated['gender'] ?? null;
        $user->date_of_birth = $validated['date_of_birth'] ?? null;

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user->fresh()
        ]);
    });


    // ========================================
    // UPLOAD / CHANGE PROFILE PHOTO
    // ========================================

    Route::post('/profile/photo', function (Request $request) {

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $user = $request->user();

        // Upload the new photo first
        $path = $request->file('profile_photo')
            ->store('profile-photos', 'public');

        if (!$path) {
            return response()->json([
                'message' => 'Unable to upload profile picture.'
            ], 500);
        }

        // Delete the previous photo after successful upload
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete(
                $user->profile_photo_path
            );
        }

        // Save the new photo path
        $user->profile_photo_path = $path;
        $user->save();

        return response()->json([
            'message' => 'Profile picture updated successfully!',
            'user' => $user->fresh()
        ]);
    });


    // ========================================
    // CHANGE PASSWORD
    // ========================================

    Route::post('/change-password', [
        AuthController::class,
        'changePassword'
    ]);


    // ========================================
    // LOGOUT
    // ========================================

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    // ========================================
    // AI APPOINTMENT ASSISTANT
    // PATIENT ONLY
    // ========================================

    Route::middleware('role:patient')->group(function () {

        Route::post('/ai-book-assistant', [
            AIAssistantController::class,
            'chat'
        ]);

    });


    // ========================================
    // PATIENT ROUTES
    // ========================================

    Route::middleware('role:patient')
        ->prefix('patient')
        ->group(function () {

            // PATIENT APPOINTMENTS

            Route::get('/appointments', [
                AppointmentController::class,
                'index'
            ]);

            Route::post('/appointments', [
                AppointmentController::class,
                'store'
            ]);

            Route::get('/appointments/{appointment}', [
                AppointmentController::class,
                'show'
            ]);


            // PATIENT POSTS

            Route::get('/posts', [
                PostController::class,
                'index'
            ]);


            // LIKE / UNLIKE POST

            Route::post('/posts/{postId}/like', [
                PostInteractionController::class,
                'toggleLike'
            ]);


            // VIEW POST COMMENTS

            Route::get('/posts/{postId}/comments', [
                PostInteractionController::class,
                'comments'
            ]);


            // ADD POST COMMENT

            Route::post('/posts/{postId}/comments', [
                PostInteractionController::class,
                'storeComment'
            ]);

        });


    // ========================================
    // DENTIST ROUTES
    // ========================================

    Route::middleware('role:dentist')
        ->prefix('dentist')
        ->group(function () {

            Route::apiResource(
                'schedules',
                ScheduleController::class
            );

        });


    // ========================================
    // STAFF ROUTES
    // ========================================

    Route::middleware('role:staff')
        ->prefix('staff')
        ->group(function () {

            // STAFF APPOINTMENTS

            Route::apiResource(
                'appointments',
                AppointmentController::class
            );


            // STAFF PATIENTS

            Route::apiResource(
                'patients',
                PatientController::class
            );


            // STAFF POSTS MANAGEMENT

            Route::apiResource(
                'posts',
                PostController::class
            );

        });


    // ========================================
    // ADMIN ROUTES
    // ========================================

    Route::middleware('role:admin')
        ->prefix('admin')
        ->group(function () {

            // ADMIN USERS

            Route::get('/users', [
                AdminUserController::class,
                'index'
            ]);

            Route::get('/users/{id}', [
                AdminUserController::class,
                'show'
            ]);


            // ADMIN DENTISTS

            Route::get('/dentists', [
                AdminDentistController::class,
                'index'
            ]);

            Route::get('/dentists/{id}', [
                AdminDentistController::class,
                'show'
            ]);

            Route::post('/dentists', [
                AdminDentistController::class,
                'store'
            ]);


            // ADMIN STAFF

            Route::get('/staff', [
                AdminStaffController::class,
                'index'
            ]);

            Route::post('/staff', [
                AdminStaffController::class,
                'store'
            ]);


            // ADMIN DASHBOARD STATISTICS

            Route::get('/dashboard-stats', [
                AdminUserController::class,
                'dashboardStats'
            ]);

        });

});
