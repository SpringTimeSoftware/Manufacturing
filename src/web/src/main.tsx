import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { queryClient } from "./api/queryClient";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/print.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element was not found.");
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
