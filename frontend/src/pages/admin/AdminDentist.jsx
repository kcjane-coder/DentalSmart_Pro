
import { useEffect, useState } from 'react';

function AdminDentists() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    specialization: '',
    bio: '',
  });

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // FETCH DENTISTS
  const fetchDentists = async () => {
    try {
      setLoading(true);
      setError('');

      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(`${API_URL}/api/admin/dentists`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load dentists.');
      }

      setDentists(
  Array.isArray(data)
    ? data
    : data.dentists?.data ||
      data.dentists ||
      data.data ||
      []
      );
    } catch (err) {
      setError(err.message || 'Unable to load dentists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDentists();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ADD DENTIST
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(`${API_URL}/api/admin/dentists`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const validationMessage = Object.values(data.errors)
            .flat()
            .join('\n');

          throw new Error(validationMessage);
        }

        throw new Error(data.message || 'Failed to create dentist.');
      }

      setSuccess('Dentist account created successfully!');

      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        specialization: '',
        bio: '',
      });

      setShowForm(false);

      await fetchDentists();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // SEARCH AND FILTER
  const filteredDentists = dentists.filter((dentist) => {
    const user = dentist.user || dentist;

    const search = searchTerm.toLowerCase();

    const fullName = `${user.first_name || ''} ${
      user.last_name || ''
    }`.toLowerCase();

    const email = (user.email || '').toLowerCase();
    const phone = (user.phone_number || '').toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      String(dentist.dentist_id || dentist.id || '').includes(search);

    const status = (dentist.status || 'Active').toLowerCase();

    const matchesStatus =
      filterStatus === 'All' ||
      status === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-users">

      {/* HEADER */}
      <div className="admin-users-header">
        <div>
          <h1>Dentist Management</h1>
          <p>Manage DentalSmart dentist accounts.</p>
        </div>

        <button
          type="button"
          className="admin-add-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
        >
          {showForm ? 'Cancel' : '+ Add Dentist'}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <p className="success-message">{success}</p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* ADD DENTIST FORM */}
      {showForm && (
        <div className="admin-dentist-form">
          <h2>Create Dentist Account</h2>

          <form onSubmit={handleSubmit}>

            <div className="admin-dentist-form-grid">

              <div>
                <label>First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Specialization</label>
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Orthodontics"
                />
              </div>

              <div>
                <label>Bio</label>
                <input
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Short dentist description"
                />
              </div>

            </div>

            <button
              type="submit"
              className="admin-add-btn"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Dentist'}
            </button>

          </form>
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="admin-appointment-filters">
        <input
          type="search"
          placeholder="Search dentist, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* DENTIST TABLE */}
      {loading ? (
        <p>Loading dentists...</p>
      ) : (
        <>
          <p className="admin-users-count">
            Showing {filteredDentists.length} of {dentists.length} dentists
          </p>

          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dentist Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Date Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredDentists.length > 0 ? (
                  filteredDentists.map((dentist) => {
                    const user = dentist.user || dentist;

                    return (
                      <tr key={dentist.dentist_id || dentist.id}>
                        <td>{dentist.dentist_id || dentist.id}</td>

                        <td>
                          {user.first_name} {user.last_name}
                        </td>

                        <td>{user.email || 'N/A'}</td>

                        <td>{user.phone_number || 'N/A'}</td>

                        <td>
                          <span
                            className={`dentist-status ${
                              (dentist.status || 'Active').toLowerCase()
                            }`}
                          >
                            {dentist.status || 'Active'}
                          </span>
                        </td>

                        <td>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">No matching dentists found.</td>
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

export default AdminDentists;
