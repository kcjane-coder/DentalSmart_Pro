<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $primaryKey = 'post_id';

    protected $fillable = [
        'caption',
        'image',
        'media_path',
        'media_type',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
