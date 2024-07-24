import React from "react";
import logo from "./assets/images/avatar1.png";
import styled from "styled-components";
import { Route, Routes, Navigate } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";
//import { WebSocketProvider } from './context/WebSocketContext';
import { UnreadMessageProvider } from './context/UnreadMessageContext';
//import GlobalSocketListener from './context/GlobalSocketListener';

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
import socketIO from "socket.io-client";
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';  // Default to localhost if no env var


/*const socket = socketIO.connect("http://localhost:4000");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
*/
const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  return (
    <>
        <UnreadMessageProvider>
            <Routes>
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
                      </Routes>
                    </Main>
                  </RequireAuth>
                }
              ></Route>
              <Route path="/login" element={<Login />}></Route>
            </Routes>
        </UnreadMessageProvider>
    </>
  );
}

export default App;
