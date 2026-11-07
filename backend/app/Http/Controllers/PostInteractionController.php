<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostComment;
use Illuminate\Http\Request;

class PostInteractionController extends Controller
{
    // ========================================
    // LIKE / UNLIKE POST
    // ========================================
    public function toggleLike(Request $request, $postId)
    {
        if ($request->user()->role !== 'patient') {
            return response()->json([
                'message' => 'Patients only.',
            ], 403);
        }

        $post = Post::where('post_id', $postId)
            ->where('is_published', true)
            ->firstOrFail();

        $like = PostLike::where('post_id', $post->post_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            PostLike::firstOrCreate([
                'post_id' => $post->post_id,
                'user_id' => $request->user()->id,
            ]);

            $liked = true;
        }

        return response()->json([
            'message' => $liked ? 'Post liked!' : 'Like removed!',
            'liked' => $liked,
            'likes_count' => PostLike::where('post_id', $post->post_id)->count(),
        ]);
    }

    // ========================================
    // GET POST COMMENTS
    // ========================================
    public function comments(Request $request, $postId)
    {
        if ($request->user()->role !== 'patient') {
            return response()->json([
                'message' => 'Patients only.',
            ], 403);
        }

        $post = Post::where('post_id', $postId)
            ->where('is_published', true)
            ->firstOrFail();

        $comments = PostComment::with('user:id,first_name,last_name')
            ->where('post_id', $post->post_id)
            ->oldest()
            ->get()
            ->map(function ($comment) {

                $user = $comment->user;

                $firstName = $user->first_name ?? '';
                $lastName = $user->last_name ?? '';

                $userName = trim($firstName . ' ' . $lastName);

                return [
                    'id' => $comment->id,
                    'comment' => $comment->comment,
                    'user_name' => $userName ?: 'Patient',
                    'created_at' => $comment->created_at,
                ];
            });

        return response()->json([
            'comments' => $comments,
            'comments_count' => $comments->count(),
        ]);
    }

    // ========================================
    // ADD COMMENT
    // ========================================
    public function storeComment(Request $request, $postId)
    {
        if ($request->user()->role !== 'patient') {
            return response()->json([
                'message' => 'Patients only.',
            ], 403);
        }

        // Remove extra spaces before validation
        $request->merge([
            'comment' => trim((string) $request->input('comment')),
        ]);

        $validated = $request->validate([
            'comment' => 'required|string|max:2000',
        ], [
            'comment.required' => 'Please enter a comment before submitting.',
            'comment.max' => 'Your comment must not exceed 2000 characters.',
        ]);

        $post = Post::where('post_id', $postId)
            ->where('is_published', true)
            ->firstOrFail();

        $user = $request->user();

        $comment = PostComment::create([
            'post_id' => $post->post_id,
            'user_id' => $user->id,
            'comment' => $validated['comment'],
        ]);

        $userName = trim(
            ($user->first_name ?? '') . ' ' .
            ($user->last_name ?? '')
        );

        return response()->json([
            'message' => 'Comment added successfully!',
            'comment' => [
                'id' => $comment->id,
                'comment' => $comment->comment,
                'user_name' => $userName ?: 'Patient',
                'created_at' => $comment->created_at,
            ],
        ], 201);
    }
}