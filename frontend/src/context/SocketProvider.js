// context/SocketProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthHeader, useIsAuthenticated, useSignOut } from 'react-auth-kit';
import axios from 'axios';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useUnreadMessage } from './UnreadMessageContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { getUnreadMessages, incrementNotifications, markAsRead, setLastVisited, unreadMessages, setUnreadMessages } = useUnreadMessage();
  const [missedMessages, setMissedMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  //const [currentTab, setCurrentTab] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const logout = useSignOut();
  const navigate = useNavigate();

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
      //console.log("test" + missed_messages_chat);
      //setLastVisited(missed_messages_chat);
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



  useEffect(() => {
    if (isAuthenticated) {
      const token = authHeader().split(' ')[1]; // Extract the token from "Bearer <token>"
      const socketInstance = io('https://spirit.lfe.ed.tum.de/express', {
        query: { token },
        transports: ['websocket'],
        autoConnect: false, // Prevent auto connection
      });

      socketInstance.on('newMessageMetadata', ( data ) => {

        //console.log('Message received:', data);
        const chatId = data.privateChatId ? data.privateChatId : 'Team';
        // Increment notifications
        incrementNotifications(chatId);
        // Get the current username based on currentTab
        /*const currentUser = teamMembers[parseInt(currentTab) - 2]?.username;
        console.log(currentUser);
        console.log(currentTab);

        // Check if the chatId matches the current tab's username or if current tab is 0 and chatId is "Team"
        if (currentUser === chatId || (parseInt(currentTab) === 1 && chatId === 'Team')) {
          // markAsRead(privateChatId);
      }*/
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
    <SocketContext.Provider value={{ currentUser, onlineStatus, socket, missedMessages, updateLastLoggedIn }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
