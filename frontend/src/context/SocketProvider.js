import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthHeader, useIsAuthenticated, useSignOut } from 'react-auth-kit';
import axios from 'axios';
import { Spin } from 'antd';
import TKIForm from "../components/TKI/TKIForm.js"
import { useNavigate } from 'react-router-dom';
import { useUnreadMessage } from './UnreadMessageContext';
import ghost from '../assets/images/ios_180x180.png';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { getUnreadMessages, incrementNotifications, setUnreadMessages } = useUnreadMessage();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const logout = useSignOut();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/me', {
        headers: {
          "Authorization": authHeader()
        }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
      navigate("/login");
      setLoading(false);
    }
  };

  const pullUnreadMessages = async () => {
    try {
      const response = await axios.get("/api/missed-chats", {
        headers: {
          "Authorization": authHeader()
        }
      });
      setUnreadMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch missed chats:', error);
    }
  };

  const handleNewMessageNotification = (data) => {
    incrementNotifications(data.privateChatId || 'Team');

    if (currentUser && data.senderId !== currentUser.username) {
      const title = "New Message!";
      const options = {
        body: `${data.senderId} sent a message in the chat`,
        icon: ghost,
        vibrate: [300, 100, 400],
      };
      navigator.serviceWorker.ready.then(async function (serviceWorker) {
        await serviceWorker.showNotification(title, options);
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      pullUnreadMessages();
    }
  }, []);

  // New useEffect for socket connection once currentUser is set
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      const token = authHeader().split(' ')[1]; // Extract the token from "Bearer <token>"
      const socketInstance = io('https://spirit.lfe.ed.tum.de/', {
        auth: {
          token: token
        },
        transports: ['websocket'],
        autoConnect: false,
      });

      socketInstance.connect();
      socketInstance.emit('joinTeam', currentUser.team_id);
      socketInstance.emit('userOnline', { team_id: currentUser.team_id, username: currentUser.username });

      socketInstance.on('newMessageMetadata', handleNewMessageNotification);

      socketInstance.on('updateUserStatus', ({ data }) => {
        // Handle online status
        console.log('User status updated', data);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.off('newMessageMetadata', handleNewMessageNotification);
        socketInstance.disconnect();
      };
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <SocketContext.Provider value={{ currentUser, socket }}>
      {children}
      <TKIForm visible={isModalOpen} onClose={() => setModalOpen(false)} />
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
