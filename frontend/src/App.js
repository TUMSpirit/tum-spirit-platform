import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  AuthProvider,
  RequireAuth,
  useAuthUser,
  useAuthHeader
} from "react-auth-kit";
import { UnreadMessageProvider } from "./context/UnreadMessageContext";
import { SocketProvider } from "./context/SocketProvider";

import Main from "./layout/Main";
import AdminMain from "./layout/AdminMain";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Kanban from "./pages/Kanban";
import Chat from "./pages/Chat";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import TypewriterDialog from "./pages/Intro";
import SetPassword from "./pages/setPasswordPage";

import CoursesAdmin from "./pages/Projects";
import CourseDetail from "./pages/CourseDetail";

import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "antd/dist/reset.css";

import axios from "axios";
import { Spin } from "antd";

// Axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

// Redirect if already authenticated
function AuthRedirect({ children }) {
  const auth = useAuthUser();
  return auth() ? <Navigate to="/redirect" replace /> : children;
}

// Determine where to redirect based on role
function RoleRedirect() {
  const auth = useAuthUser();
  const user = auth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "Admin" ? (
    <Navigate to="/admin/courses" replace />
  ) : (
    <Navigate to="/" replace />
  );
}

// Main application routes based on role and settings
function AppRoutes() {
  const auth = useAuthUser();
  const user = auth();
  const authHeader = useAuthHeader();

  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false);
  const [shouldRedirectToPassword, setShouldRedirectToPassword] = useState(false);

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/get-settings', {
        headers: {
          Authorization: authHeader(),
        },
      });
      if (response.data?.is_first_login) {
        setShouldRedirectToPassword(true);
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    } finally {
      setUserSettingsLoaded(true);
    }
  };

  if (user?.role !== "Admin") {
    fetchSettings();
  } else {
    setUserSettingsLoaded(true);
  }
}, [user]);


  if (!user) return null;

  if (!userSettingsLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (shouldRedirectToPassword) {
    return <Navigate to="/set-password" replace />;
  }

  if (user.role === "Admin") {
    return (
      <AdminMain>
        <Routes>
          <Route path="/admin/courses" element={<CoursesAdmin />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="*" element={<Navigate to="/admin/courses" replace />} />
        </Routes>
      </AdminMain>
    );
  }

  return (
    <SocketProvider>
      <Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/team" element={<Team />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Main>
    </SocketProvider>
  );
}

// Main app structure with global providers
function App() {
  return (
    <AuthProvider
      authType={"cookie"}
      authName={"_auth"}
      cookieDomain={window.location.hostname}
      cookieSecure={true}
    >
      <UnreadMessageProvider>
        <Routes>
          <Route
            path="/intro"
            element={
              <SocketProvider>
                <TypewriterDialog />
              </SocketProvider>
            }
          />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/redirect" element={<RoleRedirect />} />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="*"
            element={
              <RequireAuth loginPath="/login">
                <AppRoutes />
              </RequireAuth>
            }
          />
        </Routes>
      </UnreadMessageProvider>
    </AuthProvider>
  );
}

export default App;
