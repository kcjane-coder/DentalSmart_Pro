import React, { useEffect, useState } from "react";

function StaffDashboard() {
  const stats = [
    {
      label: 'Total Active Patients',
      value: '1,248',
      icon: 'fa-solid fa-users',
      color: 'teal',
      note: '↑ +12% this month',
    },
    {
      label: "Today's Appointments",
      value: '8',
      icon: 'fa-solid fa-calendar-check',
      color: 'orange',
      note: '● 3 Completed',
    },
    {
      label: 'Pending Dental Records',
      value: '14',
      icon: 'fa-solid fa-file-medical',
      color: 'purple',
      note: '● Requires Review',
    },
    {
      label: 'Published Blogs',
      value: '26',
      icon: 'fa-solid fa-newspaper',
      color: 'pink',
      note: '◉ 3.4k views',
    },
  ];

  const appointments = [
    ['09:00', 'Michael Brown', 'General Checkup & Cleaning', 'Dr. Sarah Jenkins', 'Completed'],
    ['10:30', 'Emma Watson', 'Root Canal Treatment', 'Dr. Sarah Jenkins', 'Upcoming'],
    ['01:15', 'David Miller', 'Teeth Whitening', 'Dr. Robert Chen', 'Upcoming'],
    ['03:00', 'Sophia Martinez', 'Tooth Extraction', 'Dr. Maria Santos', 'Upcoming'],
  ];

  return (
    <div className="staff-dashboard">
      <div className="staff-welcome-banner">
        <div>
          <h2>Good day, Staff Member!</h2>
          <p>Here's what's happening in your dental clinic today.</p>
        </div>
        <i className="fa-solid fa-tooth"></i>
      </div>

      <div className="staff-announcement">
        <i className="fa-solid fa-circle-check"></i>
        You have <strong>8 appointments</strong> scheduled for today.
        First patient at 09:00 AM.
      </div>

      <section className="staff-stats-grid">
        {stats.map((stat) => (
          <div className="staff-stat-card" key={stat.label}>
            <div>
              <span className="staff-stat-label">{stat.label}</span>
              <h2>{stat.value}</h2>
              <p className={`staff-stat-note ${stat.color}`}>{stat.note}</p>
            </div>
            <div className={`staff-stat-icon ${stat.color}`}>
              <i className={stat.icon}></i>
            </div>
          </div>
        ))}
      </section>

      <div className="staff-dashboard-columns">
        <section className="staff-panel staff-schedule-panel">
          <div className="staff-panel-heading">
            <div>
              <h3>Today's Schedule</h3>
              <p>November 04, 2026</p>
            </div>
            <a href="/staff/appointments">Manage All</a>
          </div>

          <div className="staff-appointment-list">
            {appointments.map((appointment) => (
              <div className="staff-appointment-row" key={appointment[1]}>
                <div className="staff-appointment-time">{appointment[0]}</div>
                <div className="staff-appointment-details">
                  <strong>{appointment[1]}</strong>
                  <span>{appointment[2]} • {appointment[3]}</span>
                </div>
                <span className={`staff-appointment-status ${appointment[4].toLowerCase()}`}>
                  {appointment[4]}
                </span>
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </div>
            ))}
          </div>
        </section>

        <div className="staff-right-column">
          <section className="staff-panel">
            <h3>Quick Actions</h3>
            <div className="staff-quick-actions">
              <a href="/staff/appointments">
                <i className="fa-solid fa-calendar-plus"></i>
                Book Visit
              </a>
              <a href="/staff/patients">
                <i className="fa-solid fa-user-plus"></i>
                New Patient
              </a>
              <a href="/staff/patients">
                <i className="fa-solid fa-tooth"></i>
                Dental Chart
              </a>
              <a href="/staff/reports">
                <i className="fa-solid fa-file-medical"></i>
                Reports
              </a>
            </div>
          </section>

          <section className="staff-panel staff-activity-panel">
            <h3>Recent Clinic Activity</h3>
            <div className="staff-activity-item">
              <span className="activity-dot green"></span>
              <div>
                <strong>Patient Michael Brown checked in</strong>
                <small>10 minutes ago</small>
              </div>
            </div>
            <div className="staff-activity-item">
              <span className="activity-dot blue"></span>
              <div>
                <strong>Dental chart updated for Emma Watson</strong>
                <small>45 minutes ago</small>
              </div>
            </div>
            <div className="staff-activity-item">
              <span className="activity-dot orange"></span>
              <div>
                <strong>New appointment scheduled</strong>
                <small>1 hour ago</small>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;