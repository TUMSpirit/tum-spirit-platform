import React, { createContext, useContext, useState } from 'react';

// Create a context for unread messages
export const UnreadMessageContext = createContext();

export const UnreadMessageProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState([]); 
  const [lastTimeVisited, setLastTimeVisited] = useState([]); 
  // 2D array: [[chatId, count, lastVisited], ...]

  // Increment notifications based on privateChatId or teamId
  const incrementNotifications = (chatId) => {
    //const chatId = privateChatId ? privateChatId.split('-')[1] : 'Team';

    setUnreadMessages((prevData) => {
      const index = prevData.findIndex(chat => chat[0] === chatId);
      
      if (index !== -1) {
        // Update the count if chatId already exists
        return prevData.map((chat, i) =>
          i === index
            ? [chat[0], chat[1] + 1]
            : chat
        );
      } else {
        // Add new entry if chatId does not exist
        return [...prevData, [chatId, 1]];
      }
    });
  };

  // Mark messages as read for a specific chatId
  const markAsRead = (chatId) => {
    //const chatId = privateChatId ? privateChatId.split('-')[1] : 'Team';
    setUnreadMessages((prev) =>
      prev.map((chat) =>
        chat[0] === chatId
          ? [chat[0], 0]
          : chat
      )
    );
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
  const getUnreadMessages = (chatId) => {
    const entry = unreadMessages.find(chat => chat[0] === chatId);
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
