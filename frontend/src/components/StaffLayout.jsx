
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

function StaffLayout() {
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
  const handleLogout = async () => {
    const token = sessionStorage.getItem('auth_token');

    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');

    navigate('/Login');
  };

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">

        {/* BRAND */}
        <div className="staff-brand">
          <div className="staff-brand-icon">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Logo"
          />
        </div>

          <div>
            <h2>DentalSmart</h2>
            <span>Staff Panel</span>
          </div>
        </div>

        <p className="staff-menu-label">MAIN MENU</p>

        {/* NAVIGATION */}
        <nav className="staff-navigation">

          <NavLink to="/staff/dashboard" className="staff-nav-link">
            <i className="fa-solid fa-chart-pie"></i>
            Dashboard
          </NavLink>

          <NavLink to="/staff/appointments" className="staff-nav-link">
            <i className="fa-solid fa-calendar-check"></i>
            Appointments
          </NavLink>

          <NavLink to="/staff/schedules" className="staff-nav-link">
            <i className="fa-solid fa-calendar-days"></i>
            Schedules
          </NavLink>

          <NavLink to="/staff/patients" className="staff-nav-link">
            <i className="fa-solid fa-users"></i>
            Patients
          </NavLink>

          <NavLink to="/staff/posts" className="staff-nav-link">
            <i className="fa-solid fa-tooth"></i>
            Posts
          </NavLink>

          <NavLink to="/staff/reports" className="staff-nav-link">
            <i className="fa-solid fa-chart-column"></i>
            Reports & Export
          </NavLink>

          <NavLink to="/staff/profile" className="staff-nav-link">
            <i className="fa-solid fa-user-gear"></i>
            Profile
          </NavLink>

        </nav>

        {/* SIDEBAR USER */}
        <div className="staff-sidebar-bottom">

          <div className="staff-user">

            <div className="staff-user-avatar">
              {user.profile_photo_url ? (
                <img
                  src={getPhotoUrl(user.profile_photo_url)}
                  alt="Staff Profile"
                  key={user.profile_photo_url}
                />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>

            <div className="staff-user-details">
              <strong title={fullName}>
                {fullName || 'Staff User'}
              </strong>

              <span>{user.role || 'Staff'}</span>
            </div>

          </div>

          
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
      <main className="staff-main">

        <header className="staff-topbar">
          <div className="staff-search">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              placeholder="Search patients, appointments, records..."
            />
          </div>

          <div className="staff-topbar-right">
            <span className="clinic-status">
              <span></span> Clinic Online
            </span>
          </div>
        </header>

        <Outlet />

      </main>
    </div>
  );
}

export default StaffLayout;
