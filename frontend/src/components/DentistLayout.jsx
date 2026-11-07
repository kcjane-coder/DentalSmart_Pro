import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../App.css';

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

function DentistLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  // UPDATE USER INFORMATION
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

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  const navClass = ({ isActive }) =>
    isActive ? 'dentist-nav-link active' : 'dentist-nav-link';

  return (
    <div className="dentist-layout">

      {/* SIDEBAR */}
      <aside className="dentist-sidebar">

        {/* BRAND */}
        <div className="dentist-brand">
          <div className="dentist-brand-icon">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Logo"
          />
        </div>

          <div>
            <h2>DentalSmart</h2>
            <span>DENTIST PORTAL</span>
          </div>
        </div>

        <p className="dentist-menu-label">MAIN MENU</p>

        {/* NAVIGATION */}
        <nav className="dentist-navigation">

          <NavLink
            to="/dentist/dashboard"
            className={navClass}
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/dentist/appointments"
            className={navClass}
          >
            <i className="fa-solid fa-calendar-check"></i>
            <span>Appointments</span>
          </NavLink>

          <NavLink
            to="/dentist/schedule"
            className={navClass}
          >
            <i className="fa-regular fa-clock"></i>
            <span>Give Schedule</span>
          </NavLink>

          <NavLink
            to="/dentist/records"
            className={navClass}
          >
            <i className="fa-solid fa-folder-open"></i>
            <span>Patient Records</span>
          </NavLink>

          <NavLink
            to="/dentist/notifications"
            className={navClass}
          >
            <i className="fa-regular fa-bell"></i>
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/dentist/profile"
            className={navClass}
          >
            <i className="fa-regular fa-user"></i>
            <span>Dentist Profile</span>
          </NavLink>

        </nav>

        {/* SIDEBAR USER */}
        <div className="dentist-sidebar-bottom">

          <div className="dentist-user">

            <div className="dentist-user-avatar">
              {user.profile_photo_url ? (
                <img
                  src={getPhotoUrl(user.profile_photo_url)}
                  alt="Dentist Profile"
                  key={user.profile_photo_url}
                />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>

            <div className="dentist-user-details">
              <strong title={fullName}>
                {fullName || 'Dentist User'}
              </strong>

              <span>{user.role || 'Dentist'}</span>
            </div>

          </div>

          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Log Out
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dentist-main">

        {/* PAGE CONTENT */}
        <Outlet />

      </main>
    </div>
  );
}

export default DentistLayout;
