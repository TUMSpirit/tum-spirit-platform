import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
//import axios from "axios";

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "react-auth-kit";

import {
    LightTheme,
    BaseProvider,
    styled,
    DarkTheme,
    createDarkTheme,
  } from "baseui";

export const queryClient = new QueryClient()

const Centered = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
});


const root = ReactDOM.createRoot(
    document.getElementById("root")
  );

root.render(
  <>
   <QueryClientProvider client={queryClient}>
        <AuthProvider
          authType={"cookie"}
          authName={"_auth"}
          cookieDomain={window.location.hostname}
          cookieSecure={false}
        >
            <BrowserRouter>
              <App />
            </BrowserRouter>
        </AuthProvider>
        </QueryClientProvider>
  </>
);


/*
export const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);

//axios.defaults.baseURL = 'https://api.example.com';

root.render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </BrowserRouter>
);*/
