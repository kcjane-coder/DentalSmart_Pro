import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
 const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage('');
    setSuccessMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.password_confirmation ||
      !formData.phone
    ) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!/^09\d{9}$/.test(formData.phone)) {
      setErrorMessage(
        'Enter a valid 11-digit phone number starting with 09.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            phone_number: formData.phone,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const messages = Object.values(data.errors).flat();
          setErrorMessage(messages.join(' '));
        } else {
          setErrorMessage(data.message || 'Registration failed.');
        }
        return;
      }

      // Save authentication token
        sessionStorage.setItem('auth_token', data.token);

        // Save user information
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'patient') {
          navigate('/patient/dashboard', { replace: true });
        } else {
          navigate('/Login', { replace: true });
        }

    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(
        'Cannot connect to the server. Please make sure Laravel is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-card">
        <Link to="/" className="back-link">
          ← Back
        </Link>

        <div className="logo-container">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Tooth Logo"
            className="logo"
          />
        </div>

        <h1 className="auth-title">Create Account</h1>

        <p className="auth-subtitle">
          Register for your DentalSmart account
        </p>

        {errorMessage && (
          <p className="error-message" role="alert">
            <span className="error-icon" aria-hidden="true">ⓘ </span>
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="success-message" role="status">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-first-name">
              First Name <span className="required-asterisk">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="register-first-name"
              name="first_name"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-last-name">
              Last Name <span className="required-asterisk">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="register-last-name"
              name="last_name"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address <span className="required-asterisk">*</span>
            </label>
            <input
              className="form-input"
              type="email"
              id="register-email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">
              Phone Number
              <span className="required-asterisk">*</span>
            </label>

            <input
              className="form-input"
              type="tel"
              id="register-phone"
              name="phone"
              placeholder="09XXXXXXXXX"
              value={formData.phone}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*$/.test(value)) {
                  handleChange(event);
                }
              }}
              pattern="09[0-9]{9}"
              maxLength={11}
              title="Enter an 11-digit Philippine mobile number starting with 09."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password <span className="required-asterisk">*</span>
            </label>

            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                id="register-password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                className="toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="register-password-confirmation"
            >
              Confirm Password
              <span className="required-asterisk">*</span>
            </label>

            <div className="password-wrapper">
              <input
                className="form-input"
                type={showConfirmPassword ? 'text' : 'password'}
                id="register-password-confirmation"
                name="password_confirmation"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                className="toggle-password"
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/Login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
