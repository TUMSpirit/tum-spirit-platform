// src/context/SocketProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthHeader, useIsAuthenticated, useSignOut } from 'react-auth-kit';
import axios from 'axios';
import { Spin } from 'antd';
import TKIForm from "../components/TKI/TKIForm";
import NEOFFIForm from "../components/NEOFFI/NEOFFIForm";
import { useNavigate } from 'react-router-dom';
import { useUnreadMessage } from './UnreadMessageContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [missedMessages, setMissedMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [projectInformation, setProjectInformation] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const logout = useSignOut();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFFIModalOpen, setFFIModalOpen] = useState(false);
  const { setUnreadMessages, incrementNotifications } = useUnreadMessage();

  const fetchCurrentUser = async (socketInstance) => {
    try {
      const response = await axios.get('/api/me', {
        headers: { "Authorization": authHeader() }
      });
      const { team_id, username } = response.data;
      setCurrentUser(response.data);

      socketInstance.connect();
      socketInstance.auth = { teamId: team_id };
      socketInstance.emit('joinTeam', team_id);
      socketInstance.emit('userOnline', { team_id, username });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
      navigate("/login");
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await axios.get('/api/get-settings', {
        headers: { "Authorization": authHeader() }
      });

      setUserSettings(response.data);

      if (response.data.is_first_login) {
        navigate("/set-password");
        return;
      }

      if (response.data.trigger_tki_test) {
        setModalOpen(true);
      } else if (response.data.trigger_neoffi_test) {
        setFFIModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      logout();
      navigate("/login");
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/get-project-by-teamid`, {
        headers: { "Authorization": authHeader() }
      });
      setProjectInformation(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      logout();
      navigate("/login");
    }
  };

  const updateSettings = async (field, value) => {
    try {
      await axios.post('/api/update-settings', { [field]: value }, {
        headers: { "Authorization": authHeader() }
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const updateLastLoggedIn = async (lastActiveChat) => {
    try {
      await axios.post('/api/update-last-active', { chatData: lastActiveChat }, {
        headers: { "Authorization": authHeader() }
      });
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  };

  const pullUnreadMessages = async () => {
    try {
      const response = await axios.get("/api/missed-chats", {
        headers: { "Authorization": authHeader() }
      });
      setUnreadMessages(response.data);
    } catch (error) {
      console.error('Failed to get missed chats:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = authHeader().split(' ')[1];
      const socketInstance = io('https://spirit.lfe.ed.tum.de/', {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          window.location.reload(false);
        }
      });

      socketInstance.on('newMessageMetadata', (data) => {
        const chatId = data.privateChatId || 'Team';
        incrementNotifications(chatId);
      });

      socketInstance.on('updateUserStatus', ({ data }) => {
        Object.keys(data).forEach(username => {
          data[username] = 'online';
        });
        setOnlineStatus(data);
        setLoading(false);
      });

      pullUnreadMessages();
      fetchCurrentUser(socketInstance);
      fetchUserSettings();
      fetchProject();
      setSocket(socketInstance);

      return () => {
        socketInstance.off('updateUserStatus');
        socketInstance.off('newMessageMetadata');
      };
    } else {
      logout();
      navigate("/login");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <SocketContext.Provider value={{
      currentUser,
      onlineStatus,
      socket,
      missedMessages,
      projectInformation,
      userSettings,
      updateLastLoggedIn,
      updateSettings
    }}>
      {children}
      <TKIForm visible={isModalOpen} onClose={() => setModalOpen(false)} />
      <NEOFFIForm isPreModalVisible={isFFIModalOpen} setPreModalVisible={setFFIModalOpen} />
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
