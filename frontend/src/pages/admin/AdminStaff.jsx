
import { useEffect, useState } from 'react';

function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    position: '',
  });

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // FETCH STAFF
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');

      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(`${API_URL}/api/admin/staff`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load staff.');
      }

      setStaff(
        Array.isArray(data)
          ? data
          : data.staff?.data ||
              data.staff ||
              data.data ||
              []
      );
    } catch (err) {
      setError(err.message || 'Unable to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ADD STAFF
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

      const response = await fetch(`${API_URL}/api/admin/staff`, {
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

        throw new Error(data.message || 'Failed to create staff.');
      }

      setSuccess('Staff account created successfully!');

      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        position: '',
      });

      setShowForm(false);

      await fetchStaff();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // SEARCH STAFF
  const filteredStaff = staff.filter((member) => {
    const user = member.user || member;

    const search = searchTerm.toLowerCase();

    const fullName = `${user.first_name || ''} ${
      user.last_name || ''
    }`.toLowerCase();

    const email = (user.email || '').toLowerCase();
    const phone = (user.phone_number || '').toLowerCase();
    const position = (member.position || '').toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      position.includes(search) ||
      String(member.staff_id || member.id || '').includes(search)
    );
  });

  return (
    <div className="admin-users">

      {/* HEADER */}
      <div className="admin-users-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage DentalSmart staff accounts.</p>
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
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {/* SUCCESS */}
      {success && <p className="success-message">{success}</p>}

      {/* ERROR */}
      {error && <p className="error-message">{error}</p>}

      {/* ADD STAFF FORM */}
      {showForm && (
        <div className="admin-dentist-form">
          <h2>Create Staff Account</h2>

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
                <label>Position</label>
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. Receptionist"
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="admin-add-btn"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Staff'}
            </button>
          </form>
        </div>
      )}

      {/* SEARCH */}
      <div className="admin-appointment-filters">
        <input
          type="search"
          placeholder="Search staff, email, phone, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* STAFF TABLE */}
      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <>
          <p className="admin-users-count">
            Showing {filteredStaff.length} of {staff.length} staff
          </p>

          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Date Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => {
                    const user = member.user || member;

                    return (
                      <tr key={member.staff_id || member.id}>
                        <td>{member.staff_id || member.id}</td>

                        <td>
                          {user.first_name} {user.last_name}
                        </td>

                        <td>{user.email || 'N/A'}</td>

                        <td>{user.phone_number || 'N/A'}</td>

                        <td>{member.position || 'N/A'}</td>

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
                    <td colSpan="6">No matching staff found.</td>
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

export default AdminStaff;
