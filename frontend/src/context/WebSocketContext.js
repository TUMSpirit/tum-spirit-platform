import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthHeader } from 'react-auth-kit';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const authHeader = useAuthHeader();

  useEffect(() => {
    // Fetch current user data
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/me', {
          headers: { 'Authorization': authHeader() },
        });
        const data = await response.json();

        // Initialize socket with auth data
       /* const newSocket = io('http://localhost:4000', {
          auth: { teamId: data.team_id },
        });

        setSocket(newSocket);

        newSocket.emit('joinTeam', data.team_id);*/

        // Cleanup on component unmount
       // return () => newSocket.close();
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, [authHeader]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
