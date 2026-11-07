<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'dentist_id',
        'day',
        'start_time',
        'end_time',
        'status',
    ];

    public function dentist()
    {
        return $this->belongsTo(Dentist::class);
    }
}