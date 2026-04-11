import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import KanbanBoard from "./components/KanbanBoard";
import Settings from "./components/Settings";
import { GithubProvider, useGithub } from "./context/GithubContext";
import Landing from "./components/Landing";
import "./App.css";

function AppContent() {
  const [activePage, setActivePage] = useState("dashboard");

  // ✅ get everything needed
  const { appUser, setAppUser, clearToken } = useGithub();

  // ✅ FIXED LOGOUT (VERY IMPORTANT)
  const handleLogout = () => {
    setAppUser(null);   // remove app login
    clearToken();       // 🔥 remove GitHub + repos + token
    setActivePage("dashboard"); // reset page (optional but clean)
  };

  return (
    !appUser ? (
      <Landing onLogin={(userData) => setAppUser(userData)} />
    ) : (
      <div className="app">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage}
          onLogout={handleLogout} // ✅ use fixed logout
        />

        <main className="main-content">
          {activePage === "dashboard" && (
            <Dashboard setActivePage={setActivePage} />
          )}

          {activePage === "projects" && (
            <Projects currentUser={appUser} />
          )}

          {activePage === "kanban" && (
            <KanbanBoard />
          )}

          {activePage === "settings" && (
            <Settings />
          )}
        </main>
      </div>
    )
  );
}

export default function App() {
  return (
    <GithubProvider>
      <AppContent />
    </GithubProvider>
  );
}