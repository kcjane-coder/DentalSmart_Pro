import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // DATABASE STATISTICS
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalDentists, setTotalDentists] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // FETCH ADMIN DASHBOARD STATISTICS
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = sessionStorage.getItem("auth_token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const API_URL =
          import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        const response = await fetch(
          `${API_URL}/api/admin/dashboard-stats`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard statistics."
          );
        }

        setTotalPatients(Number(data.total_patients) || 0);
        setTotalStaff(Number(data.total_staff) || 0);
        setTotalDentists(Number(data.total_dentists) || 0);
        setTotalUsers(Number(data.total_users) || 0);
      } catch (error) {
        console.error("Dashboard statistics error:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // SAMPLE APPOINTMENTS
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      time: "09:00",
      patient: "Michael Brown",
      treatment: "General Checkup & Cleaning",
      dentist: "Dr. Sarah Jenkins",
      status: "Completed",
    },
    {
      id: 2,
      time: "10:30",
      patient: "Emma Watson",
      treatment: "Root Canal Treatment",
      dentist: "Dr. Sarah Jenkins",
      status: "Upcoming",
    },
    {
      id: 3,
      time: "01:15",
      patient: "David Miller",
      treatment: "Teeth Whitening",
      dentist: "Dr. Robert Chen",
      status: "Upcoming",
    },
    {
      id: 4,
      time: "03:00",
      patient: "Sophia Martinez",
      treatment: "Tooth Extraction",
      dentist: "Dr. Maria Santos",
      status: "Upcoming",
    },
  ]);

  // RECENT ACTIVITIES
  const [activities, setActivities] = useState([
    {
      id: 1,
      message: "Patient Michael Brown checked in",
      time: "10 minutes ago",
      color: "green",
    },
    {
      id: 2,
      message: "Dental chart updated for Emma Watson",
      time: "45 minutes ago",
      color: "blue",
    },
    {
      id: 3,
      message: "New appointment scheduled",
      time: "1 hour ago",
      color: "orange",
    },
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const upcomingCount = appointments.filter(
    (appointment) => appointment.status === "Upcoming"
  ).length;

  // SEARCH AND FILTER APPOINTMENTS
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.dentist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || appointment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // DASHBOARD STATISTICS
  const stats = [
    {
      label: "Total Active Patients",
      value: statsLoading ? "..." : totalPatients.toLocaleString(),
      icon: "fa-solid fa-users",
      color: "teal",
      note: "Registered patient accounts",
    },
    {
      label: "Total Staff",
      value: statsLoading ? "..." : totalStaff.toLocaleString(),
      icon: "fa-solid fa-user-tie",
      color: "orange",
      note: "Registered staff accounts",
    },
    {
      label: "Total Dentists",
      value: statsLoading ? "..." : totalDentists.toLocaleString(),
      icon: "fa-solid fa-tooth",
      color: "purple",
      note: "Registered dentist accounts",
    },
    {
      label: "Total Users",
      value: statsLoading ? "..." : totalUsers.toLocaleString(),
      icon: "fa-solid fa-users",
      color: "pink",
      note: "All registered accounts",
    },
  ];

  // UPDATE APPOINTMENT STATUS
  const toggleAppointmentStatus = (id) => {
    const appointment = appointments.find((item) => item.id === id);

    if (!appointment) return;

    const newStatus =
      appointment.status === "Completed" ? "Upcoming" : "Completed";

    setAppointments((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    setActivities((previous) => [
      {
        id: Date.now(),
        message: `${appointment.patient}'s appointment marked as ${newStatus}`,
        time: "Just now",
        color: newStatus === "Completed" ? "green" : "orange",
      },
      ...previous,
    ]);
  };

  return (
    <div className="admin-dashboard">

      {/* WELCOME BANNER */}
      <div className="admin-welcome-banner">
        <div>
          <h2>Good day, Administrator!</h2>
          <p>Here's what's happening in your dental clinic today.</p>
        </div>
        <i className="fa-solid fa-tooth"></i>
      </div>

      {/* ANNOUNCEMENT */}
      <div className="admin-announcement">
        <i className="fa-solid fa-circle-check"></i>
        You have <strong>{appointments.length} appointments</strong> scheduled
        for today. {upcomingCount} upcoming and {completedCount} completed.
      </div>

      {/* STATISTICS */}
      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <div className="admin-stat-card" key={stat.label}>
            <div>
              <span className="admin-stat-label">{stat.label}</span>
              <h2>{stat.value}</h2>
              <p className={`admin-stat-note ${stat.color}`}>
                {stat.note}
              </p>
            </div>

            <div className={`admin-stat-icon ${stat.color}`}>
              <i className={stat.icon}></i>
            </div>
          </div>
        ))}
      </section>

      {/* DASHBOARD COLUMNS */}
      <div className="admin-dashboard-columns">

        {/* APPOINTMENTS */}
        <section className="admin-panel admin-schedule-panel">

          <div className="admin-panel-heading">
            <div>
              <h3>Today's Schedule</h3>
              <p>{today}</p>
            </div>

            <a href="/admin/appointments">Manage All</a>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="admin-appointment-filters">
            <input
              type="search"
              placeholder="Search patient, dentist, or treatment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* APPOINTMENT LIST */}
          <div className="admin-appointment-list">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <div
                  className="admin-appointment-row"
                  key={appointment.id}
                >
                  <div className="admin-appointment-time">
                    {appointment.time}
                  </div>

                  <div className="admin-appointment-details">
                    <strong>{appointment.patient}</strong>
                    <span>
                      {appointment.treatment} • {appointment.dentist}
                    </span>
                  </div>

                  <span
                    className={`admin-appointment-status ${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>

                  <div className="admin-appointment-actions">
                    <button
                      type="button"
                      title="View appointment details"
                      onClick={() =>
                        setSelectedAppointment(appointment)
                      }
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>

                    <button
                      type="button"
                      title={
                        appointment.status === "Completed"
                          ? "Mark as upcoming"
                          : "Mark as completed"
                      }
                      onClick={() =>
                        toggleAppointmentStatus(appointment.id)
                      }
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-no-appointments">
                <i className="fa-solid fa-calendar-xmark"></i>
                <p>No appointments found.</p>
              </div>
            )}
          </div>

          <div className="admin-appointment-summary">
            <span>Total: {appointments.length}</span>
            <span>Upcoming: {upcomingCount}</span>
            <span>Completed: {completedCount}</span>
          </div>

        </section>

        {/* RIGHT COLUMN */}
        <div className="admin-right-column">

          {/* QUICK ACTIONS */}
          <section className="admin-panel">
            <h3>Quick Actions</h3>

            <div className="admin-quick-actions">

              <a href="/admin/appointments">
                <i className="fa-solid fa-calendar-plus"></i>
                Book Visit
              </a>

              <a href="/admin/patients">
                <i className="fa-solid fa-user-plus"></i>
                New Patient
              </a>

              <a href="/admin/patients">
                <i className="fa-solid fa-tooth"></i>
                Dental Chart
              </a>

              <a href="/admin/reports">
                <i className="fa-solid fa-file-medical"></i>
                Reports
              </a>

            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section className="admin-panel admin-activity-panel">
            <h3>Recent Clinic Activity</h3>

            {activities.map((activity) => (
              <div className="admin-activity-item" key={activity.id}>
                <span className={`activity-dot ${activity.color}`}></span>

                <div>
                  <strong>{activity.message}</strong>
                  <small>{activity.time}</small>
                </div>
              </div>
            ))}
          </section>

        </div>
      </div>

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="admin-appointment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-heading">
              <h3>Appointment Details</h3>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
              >
                &times;
              </button>
            </div>

            <div className="admin-modal-details">
              <p>
                <strong>Patient:</strong>{" "}
                {selectedAppointment.patient}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {selectedAppointment.time}
              </p>

              <p>
                <strong>Treatment:</strong>{" "}
                {selectedAppointment.treatment}
              </p>

              <p>
                <strong>Dentist:</strong>{" "}
                {selectedAppointment.dentist}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedAppointment.status}
              </p>
            </div>

            <button
              className="admin-modal-close"
              type="button"
              onClick={() => setSelectedAppointment(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
