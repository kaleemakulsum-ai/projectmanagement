import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => newSocket.close();
  }, []);

  const joinProject = (projectId) => {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, joinProject, leaveProject, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
