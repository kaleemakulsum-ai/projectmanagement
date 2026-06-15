import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationsPanel from './NotificationsPanel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#1e293b',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        Project Manager
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '14px' }}>Welcome, {user?.username}</span>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              position: 'relative'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '8px 16px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
