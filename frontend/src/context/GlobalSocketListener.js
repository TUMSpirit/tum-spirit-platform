import React, { useContext, useEffect } from 'react';
import { WebSocketContext } from './WebSocketContext';
import { UnreadMessageContext } from './UnreadMessageContext';

const GlobalSocketListener = () => {
  const socket = useContext(WebSocketContext);
  const { incrementNotifications } = useContext(UnreadMessageContext);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        console.log('New message received globally:', message); // Debugging
        incrementNotifications();
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, incrementNotifications]);

  return null; // This component does not render anything
};

export default GlobalSocketListener;
