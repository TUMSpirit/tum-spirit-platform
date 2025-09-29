import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuthUser } from "react-auth-kit";
import { UnreadMessageProvider } from './context/UnreadMessageContext';
import { SocketProvider } from './context/SocketProvider.js';
import { UserSettingsProvider } from './context/UserSettingsProvider.js'; // Import the UserSettingsProvider
import Main from "./layout/Main";
import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import Login from "./pages/Login.js";
import Kanban from "./pages/Kanban";
import Chat from "./pages/Chat";
import Team from "./pages/Team";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import axios from 'axios';
import TypewriterDialog from "./pages/Intro.js";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

export function useRemoveTrailingSlash() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname } = location;

    // Check if the path ends with a slash and is not the root path "/"
    if (pathname !== '/' && pathname.endsWith('/')) {
      navigate(pathname.slice(0, -1), { replace: true });
    }
  }, [location, navigate]);
}

// src/index.js or src/App.js

function AuthRedirect({ children }) {
  const auth = useAuthUser();
  return auth() ? <Navigate to="/" replace /> : children;
}

function App() {
  //useRemoveTrailingSlash();
  return (
    <AuthProvider
      authType={'cookie'}
      authName={'_auth'}
      cookieDomain={window.location.hostname}
      cookieSecure={true}
    >
      <UnreadMessageProvider>
        <SocketProvider>
            <Routes>
              <Route path="/intro" element={<TypewriterDialog />} />
              <Route
                path="*"
                element={
                  <RequireAuth loginPath="/login">
                    <Main>
                      <Routes>
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/kanban" element={<Kanban />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/" element={<Home />} />
                        <Route
                          path="*"
                          element={<Navigate to="/" replace />}
                        />
                      </Routes>
                    </Main>
                  </RequireAuth>
                }
              />
              <Route
                path="/login"
                element={
                  <AuthRedirect>
                    <Login />
                  </AuthRedirect>
                }
              />
            </Routes>
        </SocketProvider>
      </UnreadMessageProvider>
    </AuthProvider >
  );
}

export default App;
