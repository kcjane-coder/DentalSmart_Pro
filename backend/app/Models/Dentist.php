<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dentist extends Model
{
    protected $primaryKey = 'dentist_id';

    protected $fillable = [
        'user_id',
        'name',
        'specialization',
        'contact',
        'bio',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'dentist_id', 'dentist_id');
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'dentist_id', 'dentist_id');
    }
}