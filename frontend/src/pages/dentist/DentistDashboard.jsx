
function DentistDashboard() {
  const appointments = [
    ['09:00 AM', 'Sarah Jenkins', 'Root Canal Evaluation', 'High Urgency', 'Confirmed'],
    ['10:30 AM', 'Emma Watson', 'Laser Teeth Whitening', 'Routine Cosmetic', 'In Progress'],
    ['01:30 PM', 'Michael Brown', 'Orthodontic Adjustment', 'Routine Follow-up', 'Upcoming'],
    ['03:00 PM', 'David Miller', 'Dental Cleaning', 'Routine Checkup', 'Upcoming'],
  ];

  return (
    <div className="dentist-dashboard">
      <div className="dentist-page-heading">
        <div>
          <h1>Dentist Dashboard</h1>
          <p>Manage your appointments and patient care.</p>
        </div>
        <span className="dentist-date">
          <i className="fa-regular fa-calendar"></i>
          November 04, 2026
        </span>
      </div>

      <section className="dentist-stats-grid">
        <div className="dentist-stat-card">
          <span>TOTAL TODAY</span>
          <h2>6 Patients</h2>
          <p>4 Confirmed, 1 In Progress</p>
          <div className="dentist-stat-icon blue">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        <div className="dentist-stat-card">
          <span>IN PROGRESS</span>
          <h2 className="blue-text">1 Patient</h2>
          <p className="green-text">Chair #2 - Tooth Whitening</p>
          <div className="dentist-stat-icon blue">
            <i className="fa-solid fa-wave-square"></i>
          </div>
        </div>

        <div className="dentist-stat-card">
          <span>AI URGENT TRIAGE</span>
          <h2 className="red-text">2 Urgent</h2>
          <p className="red-text">Severe toothache & swelling</p>
          <div className="dentist-stat-icon red">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
      </section>

      <section className="dentist-panel">
        <div className="dentist-queue-heading">
          <div>
            <h3>Today's Appointment Queue</h3>
            <span className="dentist-date-badge">Nov 04, 2026</span>
          </div>

          <label>
            Filter Status:
            <select>
              <option>All Appointments</option>
              <option>Confirmed</option>
              <option>In Progress</option>
              <option>Upcoming</option>
            </select>
          </label>
        </div>

        <div className="dentist-table-wrapper">
          <table className="dentist-appointments-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>PATIENT NAME</th>
                <th>TREATMENT / SERVICE</th>
                <th>AI BOOKING TRIAGE</th>
                <th>STATUS</th>
                <th>QUICK ACTION</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment[1]}>
                  <td className="appointment-time-cell">{appointment[0]}</td>
                  <td>
                    <strong>{appointment[1]}</strong>
                    <small>Patient record</small>
                  </td>
                  <td>{appointment[2]}</td>
                  <td>
                    <span className={`triage-badge ${appointment[3] === 'High Urgency' ? 'urgent' : 'routine'}`}>
                      <i className="fa-solid fa-circle"></i>
                      {appointment[3]}
                    </span>
                  </td>
                  <td>
                    <span className={`dentist-status ${appointment[4].toLowerCase().replace(' ', '-')}`}>
                      {appointment[4]}
                    </span>
                  </td>
                  <td>
                    <button className="view-record-btn" type="button">
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DentistDashboard;
