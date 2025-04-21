import React from 'react';

const Notifications = ({ onClose }) => {
  const notifications = [
    { date: '2024-12-27', message: 'System update completed successfully.' },
    { date: '2024-12-26', message: 'New feature added: Search functionality!' },
    { date: '2024-12-25', message: 'Happy Holidays! Enjoy our seasonal discounts.' },
  ];

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>
            <strong>{notif.date}</strong>: {notif.message}
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="close-btn">Back</button>
    </div>
  );
};

export default Notifications;
