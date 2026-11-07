
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';


const API_URL = 'http://127.0.0.1:8000';

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function getPhotoUrl(url) {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function PatientLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  // UPDATE SIDEBAR USER INFORMATION
  useEffect(() => {
    const updateUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('userUpdated', updateUser);

    return () => {
      window.removeEventListener('userUpdated', updateUser);
    };
  }, []);

  // LOGOUT
  async function handleLogout() {
    const token = sessionStorage.getItem('auth_token');

    try {
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      navigate('/Login', { replace: true });
    }
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    <div className="patient-layout">

      {/* SIDEBAR */}
      <aside className="patient-sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Logo"
          />
        </div>

          <div className="sidebar-brand-text">
            <h2>DentalSmart</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-navigation">

          <NavLink to="/patient/dashboard" className="sidebar-link">
            <i className="fa-solid fa-house"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/patient/appointment-history" className="sidebar-link">
            <i className="fa-solid fa-calendar-check"></i>
            <span>Appointment History</span>
          </NavLink>

          <NavLink to="/patient/notifications" className="sidebar-link">
            <i className="fa-solid fa-bell"></i>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/patient/ai-assistance" className="sidebar-link">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>AI Assistance / Book Appointment</span>
          </NavLink>

          <NavLink to="/patient/profile" className="sidebar-link">
            <i className="fa-solid fa-user-gear"></i>
            <span>Profile</span>
          </NavLink>

        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          {/* PATIENT INFORMATION */}
          <div className="sidebar-patient">

            <div className="patient-avatar">
              {user.profile_photo_url ? (
                <img
                  src={getPhotoUrl(user.profile_photo_url)}
                  alt="Patient Profile"
                  key={user.profile_photo_url}
                />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>

            <div className="patient-sidebar-info">

              <strong title={fullName}>
                {fullName || 'Patient User'}
              </strong>

              <span>{user.role || 'Patient'}</span>

            </div>

          </div>

          {/* LOGOUT */}
          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="patient-main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default PatientLayout;
