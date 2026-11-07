
import { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:8000/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // EDIT PROFILE
  const [showEditForm, setShowEditForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editError, setEditError] = useState('');

  // PROFILE PHOTO
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');

  // CHANGE PASSWORD
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const getToken = () => sessionStorage.getItem('auth_token');

  // UPDATE STORED USER
  const updateStoredUser = (updatedUser) => {
    const storedUser = sessionStorage.getItem('user');

    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);

      sessionStorage.setItem(
        'user',
        JSON.stringify({
          ...parsedUser,
          ...updatedUser,
        })
      );
    } catch (err) {
      console.error('Unable to update stored user:', err);
    }
  };

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();

      if (!token) {
        setError('Please log in first.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/profile`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to retrieve profile.');
        }

        const profile = data.user;

        setUser(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setPhoneNumber(profile.phone_number || '');
        setGender(profile.gender || '');
        setDateOfBirth(profile.date_of_birth?.substring(0, 10) || '');

        updateStoredUser(profile);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // CLEAN UP PHOTO PREVIEW URL
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // GET PHOTO URL
  const getPhotoUrl = (url) => {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `http://127.0.0.1:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // GET USER INITIALS
  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || '';
    const last = user?.last_name?.charAt(0) || '';

    return (first + last).toUpperCase() || 'U';
  };

  // OPEN EDIT FORM
  const openEditForm = () => {
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setPhoneNumber(user.phone_number || '');
    setGender(user.gender || '');
    setDateOfBirth(user.date_of_birth?.substring(0, 10) || '');

    setEditMessage('');
    setEditError('');
    setPhotoMessage('');
    setPhotoError('');

    setShowEditForm(true);
  };

  // SELECT PROFILE PHOTO
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Please select a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must not exceed 5MB.');
      e.target.value = '';
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError('');
    setPhotoMessage('');
  };

  // CANCEL SELECTED PHOTO
  const handleCancelPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview('');
    setPhotoError('');
    setPhotoMessage('');
  };

  // UPLOAD PROFILE PHOTO
  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      setPhotoError('Please select a profile picture first.');
      return;
    }

    const token = getToken();

    if (!token) {
      setPhotoError('Your session has expired. Please log in again.');
      return;
    }

    setPhotoLoading(true);
    setPhotoError('');
    setPhotoMessage('');

    try {
      const formData = new FormData();

      formData.append('profile_photo', selectedPhoto);

      const response = await fetch(`${API}/profile/photo`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : '';

        throw new Error(
          validationErrors || data.message || 'Unable to upload picture.'
        );
      }

      const updatedUser = data.user;

      setUser(updatedUser);
      updateStoredUser(updatedUser);

      setSelectedPhoto(null);
      setPhotoPreview('');
      setPhotoMessage('Profile picture updated successfully!');

    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoLoading(false);
    }
  };

  // UPDATE PROFILE INFORMATION
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setEditMessage('');
    setEditError('');

    if (!firstName.trim() || !lastName.trim()) {
      setEditError('Please enter your first name and last name.');
      return;
    }

    const token = getToken();

    if (!token) {
      setEditError('Your session has expired. Please log in again.');
      return;
    }

    setEditLoading(true);

    const updatedFields = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phoneNumber.trim(),
      gender: gender,
      date_of_birth: dateOfBirth || null,
    };

    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : '';

        throw new Error(
          validationErrors || data.message || 'Unable to update profile.'
        );
      }

      const updatedUser = {
        ...user,
        ...(data.user || {}),
        ...updatedFields,
      };

      setUser(updatedUser);
      updateStoredUser(updatedUser);

      setEditMessage('Profile updated successfully!');
      setShowEditForm(false);

    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    const token = getToken();

    if (!token) {
      setPasswordError('Your session has expired. Please log in again.');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API}/change-password`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : '';

        throw new Error(
          validationErrors || data.message || 'Failed to change password.'
        );
      }

      setPasswordMessage('Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setShowPasswordForm(false);

    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // INFORMATION CARD
  const InfoCard = ({ icon, label, value }) => (
    <div className="profile-info-card">
      <div className="profile-info-icon">
        <i className={icon}></i>
      </div>

      <div className="profile-info-content">
        <span>{label}</span>
        <strong>{value || 'Not provided'}</strong>
      </div>
    </div>
  );

  // LOADING
  if (loading) {
    return (
      <div className="profile-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading profile...</p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="profile-error-page">
        <i className="fa-solid fa-circle-exclamation"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return <p>No profile information found.</p>;
  }

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}
      <div className="profile-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings.</p>
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="profile-main-card">
        <div className="profile-top-design"></div>

        <div className="profile-main-content">

          {/* PROFILE AVATAR */}
          <div className="profile-avatar">
            {user.profile_photo_url ? (
              <img
                src={getPhotoUrl(user.profile_photo_url)}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              getInitials()
            )}
          </div>

          {/* USER DETAILS */}
          <div className="profile-user-details">
            <h2>{user.first_name} {user.last_name}</h2>
            <p>{user.email}</p>

            <span className="profile-role">
              <i className="fa-solid fa-user-check"></i>
              {user.role || 'Patient'}
            </span>
          </div>

          {/* EDIT BUTTON */}
          <button
            type="button"
            className="profile-edit-button"
            onClick={openEditForm}
          >
            <i className="fa-solid fa-pen"></i>
            Edit Profile
          </button>

        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {editMessage && (
        <div className="profile-alert success">
          <i className="fa-solid fa-circle-check"></i>
          {editMessage}
        </div>
      )}

      {/* PERSONAL INFORMATION */}
      <div className="profile-section-card">
        <div className="profile-section-heading">
          <div>
            <h3>Personal Information</h3>
            <p>Your personal details and contact information.</p>
          </div>

          <div className="profile-heading-icon">
            <i className="fa-solid fa-id-card"></i>
          </div>
        </div>

        <div className="profile-information-grid">

          <InfoCard
            icon="fa-solid fa-user"
            label="First Name"
            value={user.first_name}
          />

          <InfoCard
            icon="fa-solid fa-user"
            label="Last Name"
            value={user.last_name}
          />

          <InfoCard
            icon="fa-solid fa-envelope"
            label="Email Address"
            value={user.email}
          />

          <InfoCard
            icon="fa-solid fa-phone"
            label="Phone Number"
            value={user.phone_number}
          />

          <InfoCard
            icon="fa-solid fa-venus-mars"
            label="Gender"
            value={user.gender}
          />

          <InfoCard
            icon="fa-solid fa-calendar-days"
            label="Date of Birth"
            value={user.date_of_birth?.substring(0, 10)}
          />

        </div>
      </div>

      {/* ACCOUNT SECURITY */}
      <div className="profile-section-card profile-security-card">

        <div className="profile-section-heading">
          <div>
            <h3>Account Security</h3>
            <p>Manage your password and keep your account secure.</p>
          </div>

          <div className="profile-heading-icon">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>

        {passwordMessage && (
          <div className="profile-alert success">
            <i className="fa-solid fa-circle-check"></i>
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="profile-alert error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {passwordError}
          </div>
        )}

        {!showPasswordForm && (
          <div className="profile-password-card">

            <div className="profile-password-info">
              <div className="profile-info-icon">
                <i className="fa-solid fa-lock"></i>
              </div>

              <div>
                <strong>Password</strong>
                <span>Change your password to protect your account.</span>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError('');
                setPasswordMessage('');
              }}
            >
              Change Password
            </button>

          </div>
        )}

        {showPasswordForm && (
          <form
            className="profile-password-form"
            onSubmit={handleChangePassword}
          >
            <h4>Change Your Password</h4>
            <p>Enter your current password and choose a new one.</p>

            {[
              {
                label: 'Current Password',
                value: currentPassword,
                setter: setCurrentPassword,
                visible: showCurrentPassword,
                toggle: () => setShowCurrentPassword(!showCurrentPassword),
                placeholder: 'Enter current password',
                autoComplete: 'current-password',
              },
              {
                label: 'New Password',
                value: newPassword,
                setter: setNewPassword,
                visible: showNewPassword,
                toggle: () => setShowNewPassword(!showNewPassword),
                placeholder: 'Enter new password',
                autoComplete: 'new-password',
              },
              {
                label: 'Confirm New Password',
                value: confirmPassword,
                setter: setConfirmPassword,
                visible: showConfirmPassword,
                toggle: () => setShowConfirmPassword(!showConfirmPassword),
                placeholder: 'Confirm new password',
                autoComplete: 'new-password',
              },
            ].map((field) => (
              <div className="profile-form-group" key={field.label}>
                <label>{field.label}</label>

                <div className="profile-password-input">
                  <input
                    type={field.visible ? 'text' : 'password'}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    minLength={
                      field.label === 'Current Password' ? undefined : 8
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={field.toggle}
                  >
                    <i
                      className={`fa-regular ${
                        field.visible ? 'fa-eye-slash' : 'fa-eye'
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            ))}

            <div className="profile-form-actions">

              <button
                type="button"
                className="profile-cancel-button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                disabled={passwordLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>

            </div>
          </form>
        )}

      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditForm && (
        <div
          className="profile-modal-overlay"
          onClick={() => !editLoading && !photoLoading && setShowEditForm(false)}
        >
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="profile-modal-header">
              <div>
                <h3>Edit Profile</h3>
                <p>Update your photo and personal information.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                disabled={editLoading || photoLoading}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* PROFILE PHOTO UPLOAD */}
            <div className="profile-photo-upload">

              <div className="profile-photo-preview">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected profile preview"
                  />
                ) : user.profile_photo_url ? (
                  <img
                    src={getPhotoUrl(user.profile_photo_url)}
                    alt="Current profile"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>

              <div className="profile-photo-description">
                <strong>Profile Picture</strong>
                <span>Choose a photo to personalize your account.</span>
              </div>

              <label
                htmlFor="profilePhotoInput"
                className="profile-photo-select"
              >
                <i className="fa-solid fa-camera"></i>
                Choose Photo
              </label>

              <input
                id="profilePhotoInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoSelect}
                hidden
              />

              <span className="profile-photo-hint">
                JPG, PNG or WEBP. Maximum file size: 5MB.
              </span>

              {photoError && (
                <div className="profile-alert error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {photoError}
                </div>
              )}

              {photoMessage && (
                <div className="profile-alert success">
                  <i className="fa-solid fa-circle-check"></i>
                  {photoMessage}
                </div>
              )}

              {selectedPhoto && (
                <div className="profile-photo-actions">

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancelPhoto}
                    disabled={photoLoading}
                  >
                    Cancel Photo
                  </button>

                  <button
                    type="button"
                    className="profile-save-button"
                    onClick={handlePhotoUpload}
                    disabled={photoLoading}
                  >
                    {photoLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        Save Photo
                      </>
                    )}
                  </button>

                </div>
              )}

            </div>

            <div className="profile-modal-divider"></div>

            {/* EDIT PROFILE FORM */}
            {editError && (
              <div className="profile-alert error">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>

              <div className="profile-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="profile-form-group">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={() => setShowEditForm(false)}
                  disabled={editLoading || photoLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
