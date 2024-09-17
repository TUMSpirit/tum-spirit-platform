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

export async function initServiceWorker() {
    let swRegistration = await navigator.serviceWorker.register('/service-worker.js');
    let pushManager = swRegistration.pushManager;

    if (!pushManager) {
        console.error('PushManager is not active');
        return;
    }

    // Automatically subscribe without prompting or displaying additional info
    subscribeToPush();
}

export async function subscribeToPush() {
    const VAPID_PUBLIC_KEY = 'BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM';

    let swRegistration = await navigator.serviceWorker.getRegistration();
    let pushManager = swRegistration.pushManager;
    if (!pushManager) {
        console.error('PushManager is not available');
        return;
    }

    let subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
    };

    try {
        let subscription = await pushManager.subscribe(subscriptionOptions);
        await axios.post('api/subscribe', subscription);
        console.log('User subscribed to push notifications');
    } catch (error) {
        console.error('Error during subscription', error);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    initServiceWorker();
}


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
