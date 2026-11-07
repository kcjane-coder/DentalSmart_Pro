
import { useEffect, useState } from 'react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // SEARCH AND FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const token = sessionStorage.getItem('auth_token');

        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const API_URL =
          import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

        const response = await fetch(`${API_URL}/api/admin/users`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `Failed to load users. Status: ${response.status}`
          );
        }

        setUsers(data.users?.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // SEARCH AND ROLE FILTER
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`
      .toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      String(user.id).includes(search) ||
      (user.phone_number || '').toLowerCase().includes(search);

    const matchesRole =
      filterRole === 'All' ||
      (user.role || '').toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-users">
      <h1>User Management</h1>
      <p>Manage registered DentalSmart accounts.</p>

      {/* SEARCH AND FILTER */}
      <div className="admin-appointment-filters">
        <input
          type="search"
          placeholder="Search name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="dentist">Dentist</option>
          <option value="staff">Staff</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      {loading && <p>Loading users...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <p className="admin-users-count">
            Showing {filteredUsers.length} of {users.length} users
          </p>

          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Date Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        {user.first_name} {user.last_name}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || 'N/A'}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminUsers;
