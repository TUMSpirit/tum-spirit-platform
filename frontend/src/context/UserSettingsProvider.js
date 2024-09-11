// UserSettingsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthHeader} from 'react-auth-kit';


const UserSettingsContext = createContext();

export const UserSettingsProvider = ({ children }) => {
  const [userSettings, setUserSettings] = useState(null);
  const authHeader = useAuthHeader();

  const fetchUserSettings = async () => {
    try {
        const response = await axios.get('/api/get-settings', {
          headers: {
            "Authorization": authHeader()
          }
        });
        setUserSettings(response.data);
        // If the TKI test should be triggered
        if (response.data.trigger_tki_test) {
          await triggerTKITest();
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
  };

  const triggerTKITest = async () => {
    try {
      // Trigger the TKI test
      console.log('Triggering TKI test...');
      
      // After the test is done, reset the flag
      await axios.post('/reset-tki-test');
      
      // Update local state to reflect the change
      setUserSettings(prevSettings => ({ ...prevSettings, trigger_tki_test: false }));
    } catch (error) {
      console.error('Error triggering TKI test:', error);
    }
  };

  useEffect(() => {
    fetchUserSettings();
    
    // Optionally, set up a polling interval to refresh settings periodically
    //const intervalId = setInterval(fetchUserSettings, 60000); // Refresh every 60 seconds
    //return () => clearInterval(intervalId);
  }, []);

  return (
    <UserSettingsContext.Provider value={{ userSettings, fetchUserSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => useContext(UserSettingsContext);
