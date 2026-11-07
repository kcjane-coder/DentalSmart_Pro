<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    // ========================================
    // DISPLAY POSTS
    // Staff: All posts
    // Patient: Published posts only
    // Includes likes count and patient like status
    // ========================================

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $query = Post::query()
            ->addSelect([
                'likes_count' => DB::table('post_likes')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('post_likes.post_id', 'posts.post_id'),

                'liked_by_me' => DB::table('post_likes')
                    ->selectRaw('COUNT(*) > 0')
                    ->whereColumn('post_likes.post_id', 'posts.post_id')
                    ->where('post_likes.user_id', $userId),
            ])
            ->orderByDesc('created_at');

        if ($request->user()->role === 'patient') {
            $query->where('is_published', true);
        }

        return response()->json([
            'posts' => $query->get(),
        ]);
    }


    // ========================================
    // CREATE POST - STAFF ONLY
    // ========================================

    public function store(Request $request)
    {
        if ($request->user()->role !== 'staff') {
            return response()->json([
                'message' => 'Unauthorized. Staff only.',
            ], 403);
        }

        $validated = $request->validate([
            'caption' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'is_published' => 'nullable|boolean',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')
                ->store('posts', 'public');
        }

        $post = Post::create([
            'caption' => $validated['caption'],
            'image' => $imagePath,
            'media_path' => $imagePath,
            'media_type' => $imagePath ? 'image' : null,
            'is_published' => $request->boolean('is_published', true),
        ]);

        return response()->json([
            'message' => 'Post created successfully!',
            'post' => $post,
        ], 201);
    }


    // ========================================
    // VIEW SINGLE POST
    // ========================================

    public function show(Request $request, Post $post)
    {
        if (
            $request->user()->role === 'patient'
            && !$post->is_published
        ) {
            return response()->json([
                'message' => 'Post not found.',
            ], 404);
        }

        return response()->json([
            'post' => $post,
        ]);
    }


    // ========================================
    // UPDATE POST - STAFF ONLY
    // ========================================

    public function update(Request $request, Post $post)
    {
        if ($request->user()->role !== 'staff') {
            return response()->json([
                'message' => 'Unauthorized. Staff only.',
            ], 403);
        }

        $validated = $request->validate([
            'caption' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'is_published' => 'sometimes|boolean',
        ]);

        $data = [];

        if (isset($validated['caption'])) {
            $data['caption'] = $validated['caption'];
        }

        if ($request->hasFile('image')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }

            $imagePath = $request->file('image')
                ->store('posts', 'public');

            $data['image'] = $imagePath;
            $data['media_path'] = $imagePath;
            $data['media_type'] = 'image';
        }

        if ($request->has('is_published')) {
            $data['is_published'] = $request->boolean('is_published');
        }

        $post->update($data);

        return response()->json([
            'message' => 'Post updated successfully!',
            'post' => $post->fresh(),
        ]);
    }


    // ========================================
    // DELETE POST - STAFF ONLY
    // ========================================

    public function destroy(Request $request, Post $post)
    {
        if ($request->user()->role !== 'staff') {
            return response()->json([
                'message' => 'Unauthorized. Staff only.',
            ], 403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully!',
        ]);
    }
}
