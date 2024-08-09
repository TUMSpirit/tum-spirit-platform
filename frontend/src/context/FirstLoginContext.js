// src/context/FirstLoginContext.js
import React, { createContext, useContext, useState } from 'react';

const FirstLoginContext = createContext();

export function FirstLoginProvider({ children }) {
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  return (
    <FirstLoginContext.Provider value={{ isFirstLogin, setIsFirstLogin }}>
      {children}
    </FirstLoginContext.Provider>
  );
}

export function useFirstLogin() {
  const context = useContext(FirstLoginContext);
  if (context === undefined) {
    throw new Error('useFirstLogin must be used within a FirstLoginProvider');
  }
  return context;
}
