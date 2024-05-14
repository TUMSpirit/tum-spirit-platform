import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import axios from "axios";

import "./index.css";

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
);
