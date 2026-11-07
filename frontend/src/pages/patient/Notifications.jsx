
function Notifications() {
  const notifications = [
    {
      id: 1,
      icon: 'fa-calendar-check',
      title: 'Appointment Request Received',
      message: 'Your appointment request has been successfully submitted.',
      time: 'Just now',
      type: 'appointment',
      unread: true,
    },
    {
      id: 2,
      icon: 'fa-bell',
      title: 'Appointment Reminder',
      message: 'Remember to check your upcoming dental appointment.',
      time: '2 hours ago',
      type: 'reminder',
      unread: true,
    },
    {
      id: 3,
      icon: 'fa-circle-check',
      title: 'Profile Updated',
      message: 'Your patient profile information has been updated.',
      time: 'Yesterday',
      type: 'success',
      unread: false,
    },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your dental activities.</p>
        </div>
        <button className="mark-all-read">
          Mark all as read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            className={`notification-item ${notification.unread ? 'unread' : ''}`}
            key={notification.id}
          >
            <div className={`notification-icon ${notification.type}`}>
              <i className={`fa-solid ${notification.icon}`}></i>
            </div>

            <div className="notification-content">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>

            {notification.unread && (
              <span className="unread-dot"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
