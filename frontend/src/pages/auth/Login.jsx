
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!login.trim() || !password) {
      setErrorMessage('Please enter your email/phone number and password.');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
    const isPhone = /^09\d{9}$/.test(login);

    if (!isEmail && !isPhone) {
      setErrorMessage(
        'Enter a valid email address or 11-digit phone number starting with 09.'
      );
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || 'Invalid email/phone number or password.'
        );
        return;
      }

      if (!data.token || !data.user) {
        setErrorMessage('Invalid server response. Please try again.');
        return;
      }

      // Save authentication per browser tab
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      const dashboards = {
        patient: '/patient/dashboard',
        dentist: '/dentist/dashboard',
        staff: '/staff/dashboard',
        admin: '/admin/dashboard',
      };

      const destination = dashboards[data.user.role];

      if (!destination) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');

        setErrorMessage(
          'Invalid user role. Please contact the administrator.'
        );
        return;
      }

      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Login error:', error);

      setErrorMessage(
        'Cannot connect to the server. Please make sure Laravel is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <section className="login-card">
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

        <h1 className="title">Welcome Back!</h1>

        <p className="subtitle">
          Login to your DentalSmart account
        </p>

        {location.state?.message && (
          <p className="success-message" role="status">
            {location.state.message}
          </p>
        )}

        {errorMessage && (
          <p className="error-message" role="alert">
            <span className="error-icon" aria-hidden="true">
              ⓘ
            </span>
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login">
              Email or Phone Number{' '}
              <span className="required-asterisk">*</span>
            </label>

            <input
              className="form-input"
              type="text"
              id="login"
              name="login"
              placeholder="Enter your email or phone number"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password{' '}
              <span className="required-asterisk">*</span>
            </label>

            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
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

          <div className="forgot-password">
            <Link to="/ForgotPassword">
              Forgot Password?
            </Link>
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/Register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
