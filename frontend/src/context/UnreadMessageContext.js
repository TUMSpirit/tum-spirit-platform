import React, { createContext, useContext, useState } from 'react';

// Create a context for unread messages
export const UnreadMessageContext = createContext();

export const UnreadMessageProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState([]); 
  const [lastTimeVisited, setLastTimeVisited] = useState([]); 
  // 2D array: [[chatId, count, lastVisited], ...]

  // Increment notifications based on privateChatId or teamId
  const incrementNotifications = (privateChatId) => {
    setUnreadMessages((prevData) => {
      // Special case for "Team"
      if (privateChatId === 'Team') {
        const index = prevData.findIndex(chat => chat[0] === 'Team');
        if (index !== -1) {
          return prevData.map((chat, i) =>
            i === index ? ['Team', chat[1] + 1] : chat
          );
        } else {
          return [...prevData, ['Team', 1]];
        }
      }
  
      // General case for private chat IDs
      const [user1, user2] = privateChatId.split('-');
      const chatId1 = `${user1}-${user2}`;
      const chatId2 = `${user2}-${user1}`;
      
      const index = prevData.findIndex(chat => chat[0] === chatId1 || chat[0] === chatId2);
  
      if (index !== -1) {
        return prevData.map((chat, i) =>
          i === index ? [chat[0], chat[1] + 1] : chat
        );
      } else {
        return [...prevData, [chatId1, 1]];
      }
    });
  };

  // Mark messages as read for a specific chatId
  const markAsRead = (chatId) => {
    setUnreadMessages((prev) => {
      if (chatId === 'Team') {
        // Handle the special case for "Team"
        return prev.map((chat) =>
          chat[0] === 'Team'
            ? ['Team', 0]
            : chat
        );
      }
  
      // Handle the general case for private chat IDs
      const [user1, user2] = chatId.split('-');
      const chatId1 = `${user1}-${user2}`;
      const chatId2 = `${user2}-${user1}`;
  
      return prev.map((chat) =>
        chat[0] === chatId1 || chat[0] === chatId2
          ? [chat[0], 0]
          : chat
      );
    });
  };

  // Set last visited time for a specific chatId without marking messages as read
  const setLastVisited = (chatId) => {
    //const chatId = privateChatId ? privateChatId.split('-')[1] : 'Team';
    setLastTimeVisited((prev) =>
      prev.map((chat) =>
        chat[0] === chatId
          ? [chat[0], new Date().toISOString()]
          : chat
      )
    );
  };

  // Get unread messages count for a specific chatId
  const getUnreadMessages = (privateChatId) => {
    // Handle the special case for "Team"
    if (privateChatId === 'Team') {
      const entry = unreadMessages.find(chat => chat[0] === 'Team');
      return entry ? entry[1] : 0;
    }
  
    // Handle the general case for private chat IDs
    const [user1, user2] = privateChatId.split('-');
    const chatId1 = `${user1}-${user2}`;
    const chatId2 = `${user2}-${user1}`;
  
    const entry = unreadMessages.find(chat => chat[0] === chatId1 || chat[0] === chatId2);
    return entry ? entry[1] : 0;
  };

  // Get last visited time for a specific chatId
  const getLastVisited = (chatId) => {
    const entry = lastTimeVisited.find(chat => chat[0] === chatId);
    return entry ? entry[1] : null;
  };

  return (
    <UnreadMessageContext.Provider value={{
      unreadMessages,
      setUnreadMessages,
      incrementNotifications,
      markAsRead,
      setLastVisited,
      getUnreadMessages,
      getLastVisited
    }}>
      {children}
    </UnreadMessageContext.Provider>
  );
};

// Custom hook to use unread message context
export const useUnreadMessage = () => useContext(UnreadMessageContext);
