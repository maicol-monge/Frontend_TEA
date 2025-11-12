import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./main.css";
import App from "./App.jsx";

// Eliminado HashRouter para evitar Router dentro de otro Router
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
