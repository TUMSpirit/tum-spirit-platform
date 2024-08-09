// src/hooks/useBackendAuth.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';

const useBackendAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const authHeader = useAuthHeader();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get('/api/verify-token', {
          headers: { Authorization: authHeader() },
        });
        setAuthenticated(response.data.authenticated);
      } catch (error) {
        setAuthenticated(false);
      }
    };

    verifyToken();
  }, []);
  console.log(authenticated);
  return authenticated;
};

export default useBackendAuth;
