
import { useEffect, useState } from "react";
import "../../App.css";

function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // =====================================
  // FETCH REAL PATIENT APPOINTMENTS
  // =====================================

  const fetchAppointments = async () => {
    const token = sessionStorage.getItem("auth_token");

    if (!token) {
      setErrorMessage("Please log in to view your appointments.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/patient/appointments",
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
          data.message || "Unable to retrieve appointments."
        );
      }

      setAppointments(data.appointments || []);

    } catch (error) {
      console.error("Appointment history error:", error);
      setErrorMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date + "T00:00:00");

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================
  // FORMAT TIME
  // =====================================

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================
  // STATUS HELPERS
  // =====================================

  const getStatus = (appointment) => {
    const status = appointment.status?.toLowerCase();

    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";

    if (
      status === "pending" ||
      status === "approved"
    ) {
      const appointmentDate = appointment.appointment_date;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const date = new Date(appointmentDate + "T00:00:00");

      if (date >= today) {
        return "Upcoming";
      }

      return status === "approved" ? "Approved" : "Pending";
    }

    return status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Unknown";
  };

  // =====================================
  // APPOINTMENT STATISTICS
  // =====================================

  const totalAppointments = appointments.length;

  const completedAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "Completed"
  ).length;

  const upcomingAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "Upcoming"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => getStatus(appointment) === "Cancelled"
  ).length;

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const dentistName = [
        appointment.dentist_first_name,
        appointment.dentist_last_name,
      ]
        .filter(Boolean)
        .join(" ");

      const serviceName =
        appointment.service_name ||
        appointment.service ||
        appointment.treatment ||
        "";

      const matchesSearch =
        dentistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.status?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" ||
        getStatus(appointment) === filterStatus;

      return matchesSearch && matchesStatus;
    }
  );

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="appointment-history-page">

      {/* PAGE HEADER */}

      <div className="history-header">
        <div>
          <h1>Appointment History</h1>
          <p>
            Track and manage all your dental appointments.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="history-stats">

        <div className="history-stat-card">
          <div className="history-stat-icon blue">
            <i className="fa-solid fa-calendar-days"></i>
          </div>

          <div>
            <p>Total Appointments</p>
            <h2>{loading ? "..." : totalAppointments}</h2>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon green">
            <i className="fa-solid fa-check"></i>
          </div>

          <div>
            <p>Completed</p>
            <h2>{loading ? "..." : completedAppointments}</h2>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon orange">
            <i className="fa-regular fa-clock"></i>
          </div>

          <div>
            <p>Upcoming</p>
            <h2>{loading ? "..." : upcomingAppointments}</h2>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon red">
            <i className="fa-solid fa-xmark"></i>
          </div>

          <div>
            <p>Cancelled</p>
            <h2>{loading ? "..." : cancelledAppointments}</h2>
          </div>
        </div>

      </div>

      {/* APPOINTMENT CONTENT */}

      <div className="history-content">

        <div className="history-toolbar">
          <div>
            <h2>My Appointments</h2>
            <p>
              View your previous and upcoming appointments.
            </p>
          </div>

          <input
            type="text"
            className="history-search"
            placeholder="Search dentist or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER BUTTONS */}

        <div className="history-filters">

          {["All", "Upcoming", "Completed", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                type="button"
                className={`history-filter-btn ${
                  filterStatus === status ? "active" : ""
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            )
          )}

        </div>

        {/* LOADING */}

        {loading && (
          <div className="history-empty">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Loading your appointments...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && errorMessage && (
          <div className="history-empty">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{errorMessage}</p>

            <button
              className="history-view-btn"
              onClick={fetchAppointments}
            >
              Try Again
            </button>
          </div>
        )}

        {/* APPOINTMENT TABLE */}

        {!loading && !errorMessage && (
          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>
                <tr>
                  <th>Dentist</th>
                  <th>Service</th>
                  <th>Appointment Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredAppointments.length > 0 ? (

                  filteredAppointments.map((appointment) => {

                    const dentistName = [
                      appointment.dentist_first_name,
                      appointment.dentist_last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Dentist";

                    const serviceName =
                      appointment.service_name ||
                      appointment.service ||
                      appointment.treatment ||
                      "Not specified";

                    const status = getStatus(appointment);

                    return (
                      <tr key={appointment.appointment_id}>

                        <td>
                          <strong>{dentistName}</strong>
                        </td>

                        <td>{serviceName}</td>

                        <td>
                          {formatDate(appointment.appointment_date)}
                        </td>

                        <td>
                          {formatTime(appointment.appointment_time)}
                        </td>

                        <td>
                          <span
                            className={`history-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="history-view-btn"
                            onClick={() =>
                              setSelectedAppointment(appointment)
                            }
                          >
                            View Details
                          </button>
                        </td>

                      </tr>
                    );
                  })

                ) : (

                  <tr>
                    <td colSpan="6" className="history-empty">
                      <i className="fa-regular fa-calendar-xmark"></i>
                      <p>No appointment records found.</p>
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* APPOINTMENT DETAILS MODAL */}

      {selectedAppointment && (

        <div
          className="history-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >

          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="history-modal-header">
              <h2>Appointment Details</h2>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="history-detail-list">

              <p>
                <strong>Appointment ID:</strong>{" "}
                #{selectedAppointment.appointment_id}
              </p>

              <p>
                <strong>Dentist:</strong>{" "}
                {[
                  selectedAppointment.dentist_first_name,
                  selectedAppointment.dentist_last_name,
                ].filter(Boolean).join(" ") || "Dentist"}
              </p>

              <p>
                <strong>Service:</strong>{" "}
                {selectedAppointment.service_name ||
                  selectedAppointment.service ||
                  selectedAppointment.treatment ||
                  "Not specified"}
              </p>

              <p>
                <strong>Appointment Date:</strong>{" "}
                {formatDate(selectedAppointment.appointment_date)}
              </p>

              <p>
                <strong>Appointment Time:</strong>{" "}
                {formatTime(selectedAppointment.appointment_time)}
              </p>

              <p>
                <strong>Booking Date:</strong>{" "}
                {selectedAppointment.created_at
                  ? formatDate(
                      selectedAppointment.created_at.substring(0, 10)
                    )
                  : "N/A"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {getStatus(selectedAppointment)}
              </p>

            </div>

            <button
              type="button"
              className="history-close-btn"
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

export default AppointmentHistory;
