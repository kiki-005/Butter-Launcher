import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import "./i18n";

// Entry point: one render call, infinite consequences.

import { GameContextProvider } from "./hooks/gameContext";
import { UserContextProvider } from "./hooks/userContext";
import MatchaBackground from "./components/MatchaBackground";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GameContextProvider>
      <UserContextProvider>
        <MatchaBackground />
        <App />
      </UserContextProvider>
    </GameContextProvider>
  </React.StrictMode>
);
