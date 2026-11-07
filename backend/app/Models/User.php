<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ========================================
    // MASS ASSIGNMENT
    // ========================================

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'role',
        'profile_photo_path',
    ];


    // ========================================
    // HIDDEN ATTRIBUTES
    // ========================================

    protected $hidden = [
        'password',
        'remember_token',
    ];


    // ========================================
    // APPENDED ATTRIBUTES
    // ========================================

    protected $appends = [
        'profile_photo_url',
    ];


    // ========================================
    // ATTRIBUTE CASTS
    // ========================================

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    // ========================================
    // PROFILE PHOTO URL
    // ========================================

    public function getProfilePhotoUrlAttribute()
    {
        if (!$this->profile_photo_path) {
            return null;
        }

        return url(
            Storage::disk('public')->url($this->profile_photo_path)
        );
    }


    // ========================================
    // PATIENT RELATIONSHIP
    // ========================================

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }


    // ========================================
    // DENTIST RELATIONSHIP
    // ========================================

    public function dentist()
    {
        return $this->hasOne(Dentist::class);
    }


    // ========================================
    // POSTS RELATIONSHIP
    // ========================================

    public function posts()
    {
        return $this->hasMany(Post::class);
    }


    // ========================================
    // NOTIFICATIONS RELATIONSHIP
    // ========================================

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


    // ========================================
    // STAFF RELATIONSHIP
    // ========================================

    public function staff()
    {
        return $this->hasOne(Staff::class, 'user_id', 'id');
    }
}
