import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "./index.css";
import { initializeTheme } from "./hooks/useTheme";

// Apply theme before loading the app so the HTML preloader never gets stuck.
initializeTheme();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
