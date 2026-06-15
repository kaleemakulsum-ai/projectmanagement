import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationsPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '40px',
      right: '0',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      width: '350px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: '1000'
    }}>
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
        <button
          onClick={markAllAsRead}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Mark all read
        </button>
      </div>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          No notifications
        </div>
      ) : (
        <div>
          {notifications.map(notification => (
            <div
              key={notification._id}
              onClick={() => markAsRead(notification._id)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #e5e7eb',
                background: notification.read ? 'white' : '#f0f9ff',
                cursor: 'pointer'
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>
                {notification.message}
              </p>
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
