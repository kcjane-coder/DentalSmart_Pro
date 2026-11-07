
import { useEffect, useState } from 'react';
import '../../App.css';

const API_URL = 'http://127.0.0.1:8000';

function PatientDashboard() {
  const [userName, setUserName] = useState('Patient');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentsLoaded, setCommentsLoaded] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});
  const [error, setError] = useState('');

  const getHeaders = () => ({
    Accept: 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('auth_token')}`,
  });

  // ========================================
  // GET ERROR MESSAGE FROM API
  // ========================================
  const getErrorMessage = (data, fallback) => {
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];

      if (Array.isArray(firstError)) {
        return firstError[0];
      }
    }

    return data?.message || fallback;
  };

  // ========================================
  // LOAD DASHBOARD
  // ========================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = sessionStorage.getItem('auth_token');

    if (!token) {
      setError('Please log in to view your dashboard.');
      setLoading(false);
      return;
    }

    try {
      setError('');

      const userResponse = await fetch(`${API_URL}/api/user`, {
        headers: getHeaders(),
      });

      if (!userResponse.ok) {
        throw new Error('Unable to load user information.');
      }

      const userData = await userResponse.json();
      const user = userData.user;

      const fullName =
        `${user.first_name || ''} ${user.last_name || ''}`.trim();

      setUserName(fullName || user.name || user.email || 'Patient');

      const postsResponse = await fetch(
        `${API_URL}/api/patient/posts`,
        { headers: getHeaders() }
      );

      if (!postsResponse.ok) {
        throw new Error('Unable to fetch staff posts.');
      }

      const postsData = await postsResponse.json();
      setPosts(postsData.posts || []);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD COMMENTS
  // ========================================
  const fetchComments = async (postId, forceRefresh = false) => {
    if (commentsLoading[postId]) return;

    if (commentsLoaded[postId] && !forceRefresh) return;

    setCommentsLoading((previous) => ({
      ...previous,
      [postId]: true,
    }));

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }));

    try {
      const response = await fetch(
        `${API_URL}/api/patient/posts/${postId}/comments`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Unable to load comments.')
        );
      }

      setComments((previous) => ({
        ...previous,
        [postId]: data.comments || [],
      }));

      setCommentsLoaded((previous) => ({
        ...previous,
        [postId]: true,
      }));

    } catch (err) {
      console.error('Comments error:', err);

      setCommentErrors((previous) => ({
        ...previous,
        [postId]: err.message || 'Unable to load comments.',
      }));

    } finally {
      setCommentsLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  // ========================================
  // OPEN / CLOSE COMMENTS
  // ========================================
  const toggleComments = async (postId) => {
    const willOpen = !showComments[postId];

    setShowComments((previous) => ({
      ...previous,
      [postId]: willOpen,
    }));

    if (willOpen) {
      await fetchComments(postId);
    }
  };

  // ========================================
  // LIKE / UNLIKE
  // ========================================
  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/patient/posts/${postId}/like`,
        {
          method: 'POST',
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Unable to like post.')
        );
      }

      setPosts((previous) =>
        previous.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                liked_by_me: data.liked,
                likes_count: data.likes_count,
              }
            : post
        )
      );

    } catch (err) {
      alert(err.message);
    }
  };

  // ========================================
  // HANDLE COMMENT INPUT
  // ========================================
  const handleCommentInput = (postId, value) => {
    setCommentInputs((previous) => ({
      ...previous,
      [postId]: value,
    }));

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }));
  };

  // ========================================
  // SUBMIT COMMENT
  // ========================================
  const handleComment = async (postId) => {
    const commentText = (commentInputs[postId] || '').trim();

    // Prevent empty comments
    if (!commentText) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: 'Please write a comment first.',
      }));
      return;
    }

    // Prevent duplicate submission
    if (submittingComments[postId]) return;

    setSubmittingComments((previous) => ({
      ...previous,
      [postId]: true,
    }));

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }));

    try {
      const response = await fetch(
        `${API_URL}/api/patient/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: commentText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Unable to add comment.')
        );
      }

      if (!data.comment) {
        throw new Error('Comment was saved, but the response was invalid.');
      }

      // Display the new comment immediately
      setComments((previous) => ({
        ...previous,
        [postId]: [
          ...(previous[postId] || []),
          data.comment,
        ],
      }));

      // Clear input after successful submission
      setCommentInputs((previous) => ({
        ...previous,
        [postId]: '',
      }));

      setCommentsLoaded((previous) => ({
        ...previous,
        [postId]: true,
      }));

    } catch (err) {
      console.error('Submit comment error:', err);

      setCommentErrors((previous) => ({
        ...previous,
        [postId]: err.message || 'Unable to submit your comment.',
      }));

    } finally {
      setSubmittingComments((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  // ========================================
  // FORMAT DATE
  // ========================================
  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '';

    return parsedDate.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // ========================================
  // IMAGE URL
  // ========================================
  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith('http')) return image;

    return `${API_URL}/storage/${image}`;
  };

  // ========================================
  // DASHBOARD UI
  // ========================================
  return (
    <div className="dashboard-page">

      <div className="dashboard-welcome">
        <h1>
          Welcome back, {userName}! <span>👋</span>
        </h1>
      </div>

      <div className="dashboard-posts">

        {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <div className="dashboard-post">
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="dashboard-post">
            <p>No announcements or posts available yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div className="dashboard-post" key={post.post_id}>

              {/* POST HEADER */}
              <div className="dashboard-post-header">
                <div className="dashboard-dentist-avatar dashboard-staff-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>

                <div className="dashboard-dentist-info">
                  <h3>
                    DentalSmart 
                    <i className="fa-solid fa-circle-check dashboard-verified"></i>
                  </h3>

                  <p>
                    DentalSmart 
                    {post.created_at && ` • ${formatDate(post.created_at)}`}
                  </p>
                </div>
              </div>

              {/* CAPTION */}
              <div className="dashboard-post-caption">
                <p>{post.caption}</p>
              </div>

              {/* IMAGE */}
              {post.image && (
                <div className="dashboard-post-image">
                  <img
                    src={getImageUrl(post.image)}
                    alt="DentalSmart staff post"
                  />
                </div>
              )}

              {/* LIKE AND COMMENT ACTIONS */}
              <div className="dashboard-post-actions">

                <button
                  type="button"
                  onClick={() => handleLike(post.post_id)}
                  className={post.liked_by_me ? 'liked' : ''}
                >
                  <i
                    className={
                      post.liked_by_me
                        ? 'fa-solid fa-heart'
                        : 'fa-regular fa-heart'
                    }
                  ></i>

                  <span>
                    {post.liked_by_me ? 'Liked' : 'Like'}
                    {' '}({post.likes_count || 0})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleComments(post.post_id)}
                >
                  <i className="fa-regular fa-comment"></i>

                  <span>
                    {showComments[post.post_id] ? 'Hide Comments' : 'Comment'}
                    {' '}({(comments[post.post_id] || []).length})
                  </span>
                </button>

              </div>

              {/* COMMENTS SECTION */}
              {showComments[post.post_id] && (
                <div className="dashboard-comments">

                  <div className="dashboard-comment-list">

                    {commentsLoading[post.post_id] ? (
                      <p className="no-comments">
                        Loading comments...
                      </p>
                    ) : commentErrors[post.post_id] &&
                      !commentsLoaded[post.post_id] ? (
                      <div className="dashboard-comment-error">
                        <p>{commentErrors[post.post_id]}</p>

                        <button
                          type="button"
                          onClick={() => fetchComments(post.post_id, true)}
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (comments[post.post_id] || []).length === 0 ? (
                      <p className="no-comments">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      comments[post.post_id].map((comment) => (
                        <div
                          className="dashboard-comment"
                          key={comment.id}
                        >
                          <strong>
                            {comment.user_name || 'Patient'}
                          </strong>

                          <p>{comment.comment}</p>

                          <small>
                            {formatDate(comment.created_at)}
                          </small>
                        </div>
                      ))
                    )}

                  </div>

                  {/* COMMENT ERROR */}
                  {commentErrors[post.post_id] &&
                    commentsLoaded[post.post_id] && (
                      <p className="dashboard-comment-error">
                        {commentErrors[post.post_id]}
                      </p>
                    )}

                  {/* COMMENT INPUT */}
                  <form
                    className="dashboard-comment-input"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleComment(post.post_id);
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.post_id] || ''}
                      maxLength={2000}
                      disabled={!!submittingComments[post.post_id]}
                      onChange={(e) =>
                        handleCommentInput(post.post_id, e.target.value)
                      }
                    />

                    <button
                      type="submit"
                      disabled={
                        !!submittingComments[post.post_id] ||
                        !(commentInputs[post.post_id] || '').trim()
                      }
                    >
                      {submittingComments[post.post_id] ? (
                        'Sending...'
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          {' '}Send
                        </>
                      )}
                    </button>
                  </form>

                </div>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default PatientDashboard;
