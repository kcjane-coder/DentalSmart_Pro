
  import { NavLink, Outlet, useNavigate } from 'react-router-dom';


  function AdminLayout() {
    const navigate = useNavigate();

    // GET LOGGED-IN ADMIN
    function getStoredUser() {
      try {
        return JSON.parse(sessionStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    }

    const user = getStoredUser();

    // LOGOUT
    const handleLogout = () => {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      navigate('/Login', { replace: true });
    };

    // ACTIVE NAVIGATION
    const navClass = ({ isActive }) =>
      isActive ? 'admin-nav-link active' : 'admin-nav-link';

    const fullName =
      `${user.first_name || ''} ${user.last_name || ''}`.trim();

    return (
      <div className="admin-layout">

        {/* SIDEBAR */}
        <aside className="admin-sidebar">

          {/* BRAND */}
          <div className="admin-brand">
            <div className="admin-brand-icon">
            <img
              src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
              alt="DentalSmart Logo"
            />
          </div>

            <div>
              <h2>DentalSmart</h2>
              <span>Administrator Panel</span>
            </div>
          </div>

          <p className="admin-menu-label">MAIN MENU</p>

          {/* NAVIGATION */}
          <nav className="admin-navigation">

            <NavLink
              to="/admin/dashboard"
              className={navClass}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={navClass}
            >
              <i className="fa-solid fa-users"></i>
              <span>Users</span>
            </NavLink>

            <NavLink
              to="/admin/dentists"
              className={navClass}
            >
              <i className="fa-solid fa-tooth"></i>
              <span>Dentists</span>
            </NavLink>

            <NavLink
              to="/admin/staff"
              className={navClass}
            >
              <i className="fa-solid fa-user-tie"></i>
              <span>Staff</span>
            </NavLink>

            <NavLink
              to="/admin/patients"
              className={navClass}
            >
              <i className="fa-solid fa-user-group"></i>
              <span>Patients</span>
            </NavLink>

            <NavLink
              to="/admin/schedules"
              className={navClass}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>Schedules</span>
            </NavLink>

            <NavLink
              to="/admin/appointments"
              className={navClass}
            >
              <i className="fa-solid fa-calendar-check"></i>
              <span>Appointments</span>
            </NavLink>

            {/* CONTENT AND ANALYTICS */}
            <p className="admin-menu-label secondary-label">
              CONTENT & ANALYTICS
            </p>

            <NavLink
              to="/admin/reports"
              className={navClass}
            >
              <i className="fa-solid fa-chart-column"></i>
              <span>Reports & Export</span>
            </NavLink>

            <NavLink
              to="/admin/profile"
              className={navClass}
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Profile</span>
            </NavLink>

          </nav>

          {/* SIDEBAR BOTTOM */}
          <div className="admin-sidebar-bottom">

            {/* ADMIN INFORMATION */}
            <div className="admin-user">

              <div className="admin-user-avatar">
                {user.profile_photo_url ? (
                  <img
                    src={
                      user.profile_photo_url.startsWith('http')
                        ? user.profile_photo_url
                        : `http://127.0.0.1:8000${user.profile_photo_url.startsWith('/') ? '' : '/'}${user.profile_photo_url}`
                    }
                    alt="Admin Profile"
                  />
                ) : (
                  <i className="fa-solid fa-user-shield"></i>
                )}
              </div>

              <div>
                <strong title={fullName}>
                  {fullName || 'Admin User'}
                </strong>

                <span>{user.role || 'Admin'}</span>
              </div>

            </div>

            {/* LOGOUT */}
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
        <main className="admin-main">

          {/* TOPBAR */}
          <header className="admin-topbar">

            <div className="admin-topbar-right">

              <span className="clinic-status">
                <span></span>
                Clinic Online
              </span>

            </div>

          </header>

          {/* PAGE CONTENT */}
          <Outlet />

        </main>

      </div>
    );
  }

  export default AdminLayout;
