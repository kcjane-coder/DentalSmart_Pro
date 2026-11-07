
import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

function StaffPosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const token = sessionStorage.getItem('auth_token');

  // API REQUEST HELPER
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed. Status: ${response.status}`
      );
    }

    return data;
  };

  // IMAGE URL
  const getImageUrl = (path) => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${API_URL}/storage/${path.replace(/^\/+/, '')}`;
  };

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');

      if (!token) {
        throw new Error('No login token found. Please log in again.');
      }

      const data = await apiRequest('/api/staff/posts');

      setPosts(data.posts || data.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setCaption('');
    setImage(null);
    setPreview('');
    setIsPublished(true);
    setEditingPost(null);
    setShowForm(false);
  };

  // OPEN CREATE FORM
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (post) => {
    setEditingPost(post);
    setCaption(post.caption || '');
    setImage(null);
    setPreview(getImageUrl(post.image));
    setIsPublished(Boolean(post.is_published));
    setShowForm(true);
  };

  // SELECT IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // CREATE / UPDATE POST
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption.trim()) {
      alert('Please enter a post caption.');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('is_published', isPublished ? '1' : '0');

      if (image) {
        formData.append('image', image);
      }

      if (editingPost) {
        // Laravel method spoofing for image upload on update
        formData.append('_method', 'PUT');

        await apiRequest(`/api/staff/posts/${editingPost.id}`, {
          method: 'POST',
          body: formData,
        });

        alert('Clinic post updated successfully!');
      } else {
        await apiRequest('/api/staff/posts', {
          method: 'POST',
          body: formData,
        });

        alert('Clinic post created successfully!');
      }

      resetForm();
      await fetchPosts();
    } catch (err) {
      alert(err.message || 'Unable to save post.');
    } finally {
      setSaving(false);
    }
  };

  // DELETE POST
  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this clinic post?'
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/staff/posts/${post.id}`, {
        method: 'DELETE',
      });

      alert('Post deleted successfully!');
      await fetchPosts();
    } catch (err) {
      alert(err.message || 'Unable to delete post.');
    }
  };

  // PUBLISH / UNPUBLISH
  const togglePublish = async (post) => {
    try {
      await apiRequest(`/api/staff/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !post.is_published,
        }),
      });

      await fetchPosts();
    } catch (err) {
      alert(err.message || 'Unable to update post status.');
    }
  };

  // SEARCH
  const filteredPosts = posts.filter((post) => {
    const text = `${post.caption || ''} ${post.id || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="staff-posts-page">

      <div className="staff-posts-header">
        <div>
          <h1>Posts Management</h1>
          <p>Manage DentalSmart clinic announcements and publications.</p>
        </div>

        <div className="staff-posts-header-actions">
          <button
            className="staff-posts-refresh"
            onClick={fetchPosts}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            className="staff-posts-create"
            onClick={openCreateForm}
          >
            + Create Post
          </button>
        </div>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="staff-posts-card staff-posts-form-card">
          <div className="staff-posts-form-header">
            <h2>{editingPost ? 'Edit Clinic Post' : 'Create Clinic Post'}</h2>

            <button
              type="button"
              className="staff-posts-close"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Post Caption</label>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your clinic announcement, promotion, or dental care tips..."
              rows="5"
              maxLength="5000"
              required
            />

            <label>Upload Image</label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
            />

            {preview && (
              <div className="staff-posts-preview">
                <img src={preview} alt="Post preview" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview('');
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}

            <label className="staff-posts-publish-option">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish this post immediately
            </label>

            <div className="staff-posts-form-actions">
              <button
                type="button"
                className="staff-posts-cancel"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="staff-posts-submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingPost
                    ? 'Save Changes'
                    : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POSTS LIST */}
      <div className="staff-posts-card">
        <div className="staff-posts-toolbar">
          <input
            type="text"
            placeholder="Search clinic posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span>{posts.length} Total Posts</span>
        </div>

        {loading ? (
          <p className="staff-posts-message">Loading posts...</p>
        ) : error ? (
          <div className="staff-posts-error">
            <p>{error}</p>
            <button onClick={fetchPosts}>Try Again</button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="staff-posts-empty">
            <h3>No Clinic Posts Yet</h3>
            <p>Create your first DentalSmart clinic announcement.</p>
            <button onClick={openCreateForm}>+ Create First Post</button>
          </div>
        ) : (
          <div className="staff-posts-grid">
            {filteredPosts.map((post) => (
              <div className="staff-post-item" key={post.id}>
                {post.image && (
                  <img
                    className="staff-post-image"
                    src={getImageUrl(post.image)}
                    alt="Clinic post"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}

                <div className="staff-post-content">
                  <div className="staff-post-meta">
                    <span>DentalSmart Clinic</span>
                    <span>
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>

                  <p className="staff-post-caption">{post.caption}</p>

                  <span
                    className={`staff-post-status ${
                      post.is_published ? 'published' : 'draft'
                    }`}
                  >
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>

                  <div className="staff-post-actions">
                    <button onClick={() => openEditForm(post)}>
                      Edit
                    </button>

                    <button onClick={() => togglePublish(post)}>
                      {post.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      className="delete"
                      onClick={() => handleDelete(post)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffPosts;
