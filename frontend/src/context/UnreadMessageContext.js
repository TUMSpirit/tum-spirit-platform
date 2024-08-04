import React, { createContext, useContext, useState } from 'react';

export const UnreadMessageContext = createContext();

export const UnreadMessageProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);

  const incrementNotifications = () => {
    setUnreadMessages((prev) => prev + 1);
  };

  return (
    <UnreadMessageContext.Provider value={{ unreadMessages, setUnreadMessages, incrementNotifications}}>
      {children}
    </UnreadMessageContext.Provider>
  );
};

export const useUnreadMessage = () => {
  return useContext(UnreadMessageContext);
};
