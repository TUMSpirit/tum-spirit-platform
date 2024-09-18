import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
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

// src/index.js or src/App.js

function AuthRedirect({ children }) {
  const auth = useAuthUser();
  return auth() ? <Navigate to="/home" replace /> : children;
}

function App() {
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
                      <Route path="/home" element={<Home />} />
                      <Route
                        path="*"
                        element={<Navigate to="/home" replace />}
                      />
                      <Route
                        path="/"
                        element={<Navigate to="/home" replace />}
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
