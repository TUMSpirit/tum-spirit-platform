import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthHeader, useIsAuthenticated, useSignOut } from 'react-auth-kit';
import axios from 'axios';
import { Spin } from 'antd';
import TKIForm from "../components/TKI/TKIForm.js"
import NEOFFIForm from "../components/NEOFFI/NEOFFIForm.js"
import { useNavigate } from 'react-router-dom';
import { useUnreadMessage } from './UnreadMessageContext';
import useNotificationPermission from './NotificationPermission';


const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { getUnreadMessages, incrementNotifications, markAsRead, setLastVisited, unreadMessages, setUnreadMessages } = useUnreadMessage();
  const [missedMessages, setMissedMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [projectInformation, setProjectInformation] = useState([]);
  //const [currentTab, setCurrentTab] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const logout = useSignOut();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFFIModalOpen, setFFIModalOpen] = useState(false);

  //useNotificationPermission();

  const fetchCurrentUser = async (socketInstance) => {
    try {
      const response = await axios.get('/api/me', {
        headers: {
          "Authorization": authHeader()
        }
      });
      const { team_id, username, missed_messages_chat } = response.data;
      console.log(response.data);
      setCurrentUser(response.data);
      socketInstance.connect();
      socketInstance.auth = { teamId: team_id };
      socketInstance.emit('joinTeam', team_id);
      socketInstance.emit('userOnline', { team_id, username });
      // Notify server that user is online
      // Set loading to false after fetching user and connecting socket
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
      navigate("/login");
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await axios.get('/api/get-settings', {
        headers: {
          "Authorization": authHeader()
        }
      });
      setUserSettings(response.data);
      // If the TKI test should be triggered
      if (response.data.is_first_login) {
        //updateSettings('is_first_login', false);
        navigate("/intro");
      }
      // Set the TKI test state, but don't open the modal here
      if (!response.data.is_first_login && response.data.trigger_tki_test) {
        setModalOpen(true);
      }
      if (!response.data.is_first_login && !response.data.trigger_tki_test && response.data.trigger_neoffi_test) {
        setFFIModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
      navigate("/login");
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/get-project-by-teamid`, {
        headers: {
          "Authorization": authHeader()
        }
      });
      setProjectInformation(response.data);
    } catch (error) {
      console.error('milestones:', error);
      logout();
      navigate("/login");
      setLoading(false);
    }
  };


  const updateSettings = async (field, value) => {
    try {
      const response = await axios.post('/api/update-settings',
        {
          [field]: value  // Dynamically setting the field and its value
        },
        {
          headers: {
            "Authorization": authHeader()
          }
        }
      );

      console.log(`User settings updated: ${field} set to`, response.data);
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };


  const updateLastLoggedIn = async (lastActiveChat) => {
    console.log(lastActiveChat);
    try {
      const response = await axios.post('/api/update-last-active', { "chatData": lastActiveChat }, {
        headers: {
          "Authorization": authHeader()
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Failed to update last log in', error);
    }
  };


  const pullUnreadMessages = async () => {
    try {
      const response = await axios.get(
        "/api/missed-chats", {
        headers: {
          "Authorization": authHeader()
        }
      }
      );
      setUnreadMessages(response.data);
    } catch (error) {
      console.error('Failed to update last log in', error);
    }
  };


    // Register Service Worker and ask for notification permission
  /*async function registerServiceWorkerAndSubscribe() {
      const publicVapidKey = 'BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM';

      // Request notification permission from the user
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
          console.error('Notification permission denied.');
          return;
      }
  
      console.log('Notification permission granted.');
  
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
  
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
  
      console.log('Push subscription:', subscription);
  
      // Send subscription to backend
      await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
      });
  }
  
  // Helper to convert VAPID public key from base64
  function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
  }*/


  const closeModal = async () => {
    setModalOpen(false);
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Reconnect the socket when the app becomes visible
      window.location.reload(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = authHeader().split(' ')[1]; // Extract the token from "Bearer <token>"
      const socketInstance = io('https://spirit.lfe.ed.tum.de/', {
        auth: {
          token: token
        },
        transports: ['websocket'],
        autoConnect: false // Prevent auto connection
      });

      //registerServiceWorkerAndSubscribe();
      document.addEventListener('visibilitychange', handleVisibilityChange);

      socketInstance.on('newMessageMetadata', (data) => {

        //console.log('Message received:', data);
        const chatId = data.privateChatId ? data.privateChatId : 'Team';
        // Increment notifications
        incrementNotifications(chatId);
        //showNotification();         
      });

      socketInstance.on('updateUserStatus', ({ data }) => {
        for (const username in data) {
          data[username] = 'online';
        }
        setOnlineStatus(data);
        setLoading(false);
      });



      socketInstance.on('userDisconnected', () => {
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        //updateLastLoggedIn(unreadMessages);
      });


      pullUnreadMessages();
      fetchCurrentUser(socketInstance);
      fetchUserSettings();
      fetchProject();
      setSocket(socketInstance);

      return () => {
        socketInstance.off('updateUserStatus');
        socketInstance.off('newMessageMetadata');
        //updateLastLoggedIn(unreadMessages);
        //socketInstance.disconnect();
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
    <SocketContext.Provider value={{ currentUser, onlineStatus, socket, missedMessages, projectInformation, userSettings, updateLastLoggedIn, updateSettings }}>
      {children}
      <TKIForm visible={isModalOpen} onClose={closeModal} />
      <NEOFFIForm isPreModalVisible={isFFIModalOpen} setPreModalVisible={setFFIModalOpen} />
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
